import httpx
import secrets
import hashlib
import base64
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from urllib.parse import urlencode, quote
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logger import logger, log_social_api_call
from app.core.exceptions import (
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
)
from app.core.security import create_access_token, create_refresh_token, hash_password
from app.core.redis_client import get_redis
from app.core.oauth_config import (
    oauth_settings,
    OAuthProvider,
    OAuthProviderConfig,
)
from app.models.domain import User, OAuthAccount, OAuthState, UserRole

class OAuthService:
    def __init__(self,db:AsyncSession):
        self.db=db
        self.http_client:Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self.http_client is None or self.http_client.is_closed:
            self.http_client = httpx.AsyncClient(
                timeout=30.0,
                follow_redirects=True,
                limits=httpx.Limits(
                    max_keepalive_connections=5,max_connections=20
                ),
            )
        return self.http_client
    
    async def close(self):
        if self.http_client and not self.http_client.is_closed:
            await self.http_client.aclose()
            self.http_client = None
    
    async def create_state(
        self,
        provider: OAuthProvider,
        redirect_uri: Optional[str] = None,
        link_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> str:
        state = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(
            seconds=settings.OAUTH_STATE_EXPIRE_SECONDS
        )
        state_obj=OAuthState(
            state=state,
            provider=provider,
            redirect_uri=redirect_uri,
            link_user_id=link_user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
        )
        self.db.add(state_obj)
        await self.db.commit()
        return state
    async def validate_state(
        self,
        state: str,
        provider: OAuthProvider,
        clear_after_validation: bool = True,
        ip_address: Optional[str] = None,
    ) -> OAuthState:
        stmt = select(OAuthState).where(
            OAuthState.state == state,
            OAuthState.provider == provider,
        )
        result = await self.db.execute(stmt)
        state_obj = result.scalar_one_or_none()
        if not state_obj:
            raise BadRequestException("Invalid or expired state")

        if state_obj.expires_at < datetime.utcnow():
            if clear_after_validation:
                await self.db.delete(state_obj)
                await self.db.commit()
            raise BadRequestException("Expired state")
        if ip_address and state_obj.ip_address != ip_address:
            logger.warning(
                f"IP mismatch for state {state}: stored={state_obj.ip_address}, provided={ip_address}"
            )
        if clear_after_validation:
            await self.db.delete(state_obj)
            await self.db.commit()
        
        state_obj.used_at = datetime.utcnow()
        await self.db.commit()
        return state_obj
    
    async def get_authorization_url(
        self,
        provider: OAuthProvider,
        redirect_uri: Optional[str] = None,
        link_user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> str:
        config = oauth_settings.get_provider(provider)
        if not config or not config.enabled:
            raise BadRequestException(
                message=f"OAuth provider '{provider.value}' is not enabled",
                error_code="OAUTH_PROVIDER_DISABLED",
            )
        
        state = await self.create_state(
            provider=provider,
            redirect_uri=redirect_uri,
            link_user_id=link_user_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        params = {
            "client_id": config.client_id,
            "redirect_uri": config.redirect_uri,
            "response_type": "code",
            "scope": " ".join(config.scopes),
            "state": state,
        }
        
        if provider == OAuthProvider.GOOGLE:
            params.update({
                "access_type": "offline",
                "prompt": "consent",
                "include_granted_scopes": "true",
            })
        elif provider == OAuthProvider.GITHUB:
            params["allow_signup"] = "true"
        
        auth_url = f"{config.authorize_url}?{urlencode(params)}"
        
        logger.info(f"🔗 Generated {provider.value} authorization URL")
        return auth_url
    
    async def exchange_code_for_tokens(
        self,provider:OAuthProvider,code:str,
    ) -> Dict[str,Any]:
        config = oauth_settings.get_provider(provider)
        if not config: 
            raise BadRequestException(
            message="Invalid provider"
        )
        client = await self._get_client()
        data = {
            "client_id": config.client_id,
            "client_secret": config.client_secret,
            "code": code,
            "redirect_uri": config.redirect_uri,
            "grant_type": "authorization_code",
        }
        
        headers = {
            "Accept": "application/json",
        }
        try:
            start_time = datetime.utcnow()
            response = await client.post(
                config.token_url,data=data,headers=headers
            )
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            log_social_api_call(
                platform=provider.value,
                endpoint="token_exchange",
                status_code=response.status_code,
                duration_ms=duration,
                success=response.ok,
                error=response.text if not response.ok else None,
            )
            if response.status_code != 200:
                logger.error(f"Token exchange failed: {response.text}")
                raise UnauthorizedException(
                    message="Failed to exchange authorization code",
                    error_code="OAUTH_TOKEN_EXCHANGE_FAILED"
                )
            token_data = response.json()
            if "access_token" not in token_data:
                raise UnauthorizedException(
                    message="Invalid token response from provider",
                    error_code="OAUTH_INVALID_TOKEN_RESPONSE",
                )
            return token_data
        except httpx.HTTPStatusError as e:
            logger.error(f"Token exchange HTTP error: {e}")
            raise UnauthorizedException(
                message="Failed to exchange authorization code",
                error_code="OAUTH_TOKEN_EXCHANGE_HTTP_ERROR",
                details=str(e)
            )
    
    async def fetch_user_info(
        self,provider:OAuthProvider,access_token:str,
    ) -> Dict[str,Any]:
        config=oauth_settings.get_provider(provider)
        if not config:
            raise BadRequestException(
                message="Invalid provider"
            )
        client = await self._get_client()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        try:
            start_time = datetime.utcnow()
            response = await client.get(
                config.userinfo_url,headers=headers
            )
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            log_social_api_call(
                platform=provider.value,
                endpoint="userinfo",
                status_code=response.status_code,
                duration_ms=duration,
                success=response.ok,
                error=response.text if not response.ok else None,
            )
            if response.status_code != 200:
                logger.error(f"User info fetch failed: {response.text}")
                raise UnauthorizedException(
                    message="Failed to fetch user info",
                    error_code="OAUTH_USERINFO_FETCH_FAILED"
                )
            user_info = response.json()
            if "id" not in user_info:
                raise UnauthorizedException(
                    message="Invalid user info response from provider",
                    error_code="OAUTH_INVALID_USERINFO_RESPONSE",
                )
            return user_info
        except httpx.HTTPStatusError as e:
            logger.error(f"User info fetch HTTP error: {e}")
            raise UnauthorizedException(
                message="Failed to fetch user info",
                error_code="OAUTH_USERINFO_FETCH_HTTP_ERROR",
                details=str(e)
            )
    
    async def _fetch_github_primary_email(
        self,client:httpx.AsyncClient,access_token:str
    ) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        try:
            start_time = datetime.utcnow()
            response = await client.get(
                "https://api.github.com/user/emails",headers=headers
            )
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            log_social_api_call(
                platform=OAuthProvider.GITHUB.value,
                endpoint="user_email",
                status_code=response.status_code,
                duration_ms=duration,
                success=response.ok,
                error=response.text if not response.ok else None,
            )
            if response.status_code == 200:
                email = response.json()
                for em in email:
                    if em.get("primary") and em.get("verified"):
                        return em.get("email")
                for em in email:
                    if em.get("verified"):
                        return em.get("email")
                if email:
                    return email[0].get("email")
                logger.warning(
                    "No primary verified email found for Github user",
                    extra={
                        "emails": [em.get("email") for em in email],
                    }
                )
        except httpx.HTTPStatusError as e:
            logger.error(f"User info fetch HTTP error: {e}")
            raise UnauthorizedException(
                message="Failed to fetch user info",
                error_code="OAUTH_USERINFO_FETCH_HTTP_ERROR",
                details=str(e)
            )
    
    def extract_user_data(
        self,
        provider: OAuthProvider,
        raw_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        config = oauth_settings.get_provider(provider)
        if not config:
            raise BadRequestException(message="Invalid provider")
        
        email = raw_data.get(config.email_field)
        name = raw_data.get(config.name_field) or raw_data.get("login", "")
        avatar = raw_data.get(config.avatar_field)
        provider_id = str(raw_data.get(config.id_field, ""))
        
        username = None
        if email:
            username = email.split("@")[0]
        elif name:
            username = name.lower().replace(" ", "_")
        else:
            username = f"user_{provider_id[:8]}"
        
        import re
        username = re.sub(r"[^a-zA-Z0-9_]", "", username)
        if not username or not username[0].isalpha():
            username = f"user_{username}"
        username = username[:50]
        
        email_verified = raw_data.get("email_verified", True)
        if provider == OAuthProvider.GITHUB:
            email_verified = True 
        
        return {
            "provider_id": provider_id,
            "email": email,
            "email_verified": email_verified,
            "name": name,
            "username": username,
            "avatar": avatar,
            "raw_data": raw_data,
        }
    
    async def find_or_create_user(
        self,
        provider: OAuthProvider,
        user_data: Dict[str, Any],
        link_user_id: Optional[str] = None,
        tokens: Optional[Dict[str, Any]] = None,
    ) -> Tuple[User, bool]:
        """
        Find or create a user from OAuth data
        Returns (user, is_new_user)
        """
        provider_id = user_data["provider_id"]
        email = user_data["email"]
        username = user_data["username"]
        
        stmt = select(OAuthAccount).where(
            OAuthAccount.provider == provider.value,
            OAuthAccount.provider_user_id == provider_id,
        )
        result = await self.db.execute(stmt)
        oauth_account = result.scalar_one_or_none()
        
        if oauth_account:
            if tokens:
                oauth_account.access_token = tokens.get("access_token")
                oauth_account.refresh_token = tokens.get("refresh_token")
                if tokens.get("expires_in"):
                    oauth_account.token_expires_at = datetime.utcnow() + timedelta(
                        seconds=int(tokens["expires_in"])
                    )
                oauth_account.scope = tokens.get("scope")
            
            oauth_account.last_used_at = datetime.utcnow()
            oauth_account.profile_data = user_data["raw_data"]
            
            stmt = select(User).where(User.id == oauth_account.user_id)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                raise NotFoundException(message="User account not found")
            
            await self.db.commit()
            logger.info(f"✅ Existing OAuth user logged in: {user.email}")
            return user, False
        
        if link_user_id:
            stmt = select(User).where(User.id == link_user_id)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                raise NotFoundException(message="User to link not found")
            
            # Create OAuth account link
            await self._create_oauth_account(user, provider, user_data, tokens)
            
            logger.info(f"🔗 OAuth account linked to user: {user.email}")
            return user, False
        
        if email and settings.OAUTH_ALLOW_ACCOUNT_LINKING:
            stmt = select(User).where(User.email == email)
            result = await self.db.execute(stmt)
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                # Link OAuth to existing email account
                await self._create_oauth_account(existing_user, provider, user_data, tokens)
                logger.info(f"🔗 Auto-linked OAuth to existing user: {existing_user.email}")
                return existing_user, False
        
        if not settings.OAUTH_AUTO_CREATE_USERS:
            raise BadRequestException(
                message="Account does not exist. Please register first.",
                error_code="OAUTH_USER_NOT_FOUND",
            )
        
        if not email:
            raise BadRequestException(
                message="Email is required. Please make your email public.",
                error_code="OAUTH_EMAIL_REQUIRED",
            )
        
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise ConflictException(message="Email already registered")
        
        final_username = await self._generate_unique_username(username)
        
        user = User(
            email=email,
            username=final_username,
            full_name=user_data["name"],
            avatar_url=user_data["avatar"],
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            has_password=False,
            is_oauth_only=True,
            is_active=True,
            is_verified=user_data.get("email_verified", False),
            role=UserRole.USER,
            oauth_providers=[provider.value],
            oauth_last_login=provider.value,
        )
        
        self.db.add(user)
        await self.db.flush()
        
        await self._create_oauth_account(user, provider, user_data, tokens)
        
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info(f"🎉 New OAuth user created: {user.email} via {provider.value}")
        return user, True
    
    async def _create_oauth_account(
        self,
        user: User,
        provider: OAuthProvider,
        user_data: Dict[str, Any],
        tokens: Optional[Dict[str, Any]] = None,
    ) -> OAuthAccount:
        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider.value,
            provider_user_id=user_data["provider_id"],
            provider_email=user_data["email"] or "",
            provider_username=user_data.get("username"),
            access_token=tokens.get("access_token") if tokens else None,
            refresh_token=tokens.get("refresh_token") if tokens else None,
            scope=tokens.get("scope") if tokens else None,
            profile_data=user_data.get("raw_data", {}),
            last_used_at=datetime.utcnow(),
            is_active=True,
        )
        
        if tokens and tokens.get("expires_in"):
            oauth_account.token_expires_at = datetime.utcnow() + timedelta(
                seconds=int(tokens["expires_in"])
            )
        
        self.db.add(oauth_account)
        
        providers = user.oauth_providers or []
        if provider.value not in providers:
            providers.append(provider.value)
        user.oauth_providers = providers
        user.oauth_last_login = provider.value
        
        return oauth_account
    
    async def _generate_unique_username(self, base: str) -> str:
        username = base
        counter = 1
        
        while True:
            stmt = select(User).where(User.username == username)
            result = await self.db.execute(stmt)
            if not result.scalar_one_or_none():
                return username
            
            username = f"{base}_{counter}"
            counter += 1
            
            if counter > 9999:
                username = f"{base}_{secrets.token_hex(4)}"
                return username
    
    async def complete_oauth_flow(
        self,
        provider: OAuthProvider,
        code: str,
        state: str,
    ) -> Dict[str, Any]:
        oauth_state = await self.validate_state(state, provider)
        
        token_data = await self.exchange_code_for_tokens(provider, code)
        access_token = token_data["access_token"]
        
        raw_user_data = await self.fetch_user_info(provider, access_token)
        user_data = self.extract_user_data(provider, raw_user_data)
        user, is_new = await self.find_or_create_user(
            provider=provider,
            user_data=user_data,
            link_user_id=str(oauth_state.link_user_id) if oauth_state.link_user_id else None,
            tokens=token_data,
        )
        
        user.last_login_at = datetime.utcnow()
        user.last_seen_at = datetime.utcnow()
        await self.db.commit()
        
        jwt_access_token = create_access_token({"sub": str(user.id)})
        jwt_refresh_token = create_refresh_token({"sub": str(user.id)})
        
        return {
            "user": user,
            "access_token": jwt_access_token,
            "refresh_token": jwt_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "is_new_user": is_new,
            "provider": provider.value,
            "link_user_id": str(oauth_state.link_user_id) if oauth_state.link_user_id else None,
        }
    
    async def link_account(
        self,
        user_id: str,
        provider: OAuthProvider,
        provider_user_id: str,
        provider_email: str,
        provider_username: Optional[str] = None,
        tokens: Optional[Dict[str, Any]] = None,
        profile_data: Optional[Dict[str, Any]] = None,
    ) -> OAuthAccount:
        stmt = select(OAuthAccount).where(
            OAuthAccount.provider == provider.value,
            OAuthAccount.provider_user_id == provider_user_id,
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            if str(existing.user_id) == user_id:
                return existing
            raise ConflictException(
                message="This account is already linked to another user",
                error_code="OAUTH_ALREADY_LINKED",
            )
        
        stmt = select(OAuthAccount).where(
            OAuthAccount.user_id == user_id,
            OAuthAccount.provider == provider.value,
        )
        result = await self.db.execute(stmt)
        existing_user_link = result.scalar_one_or_none()
        
        if existing_user_link:
            raise ConflictException(
                message=f"Already linked to {provider.value}",
                error_code="OAUTH_PROVIDER_ALREADY_LINKED",
            )
        
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise NotFoundException(message="User not found")
        
        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider.value,
            provider_user_id=provider_user_id,
            provider_email=provider_email,
            provider_username=provider_username,
            access_token=tokens.get("access_token") if tokens else None,
            refresh_token=tokens.get("refresh_token") if tokens else None,
            scope=tokens.get("scope") if tokens else None,
            profile_data=profile_data or {},
            last_used_at=datetime.utcnow(),
            is_active=True,
        )
        
        if tokens and tokens.get("expires_in"):
            oauth_account.token_expires_at = datetime.utcnow() + timedelta(
                seconds=int(tokens["expires_in"])
            )
        
        self.db.add(oauth_account)
        
        providers = user.oauth_providers or []
        if provider.value not in providers:
            providers.append(provider.value)
        user.oauth_providers = providers
        
        await self.db.commit()
        
        logger.info(f"🔗 {provider.value} linked to user: {user.email}")
        return oauth_account
    
    async def unlink_account(
        self,
        user_id: str,
        provider: OAuthProvider,
    ) -> bool:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise NotFoundException(message="User not found")
        
        providers = user.oauth_providers or []
        other_providers = [p for p in providers if p != provider.value]
        
        if not user.has_password and len(other_providers) == 0:
            raise BadRequestException(
                message="Cannot unlink last authentication method. Please set a password first.",
                error_code="OAUTH_LAST_AUTH_METHOD",
            )
        
        stmt = select(OAuthAccount).where(
            OAuthAccount.user_id == user_id,
            OAuthAccount.provider == provider.value,
        )
        result = await self.db.execute(stmt)
        oauth_account = result.scalar_one_or_none()
        
        if not oauth_account:
            raise NotFoundException(message=f"{provider.value} account not linked")
        
        oauth_account.is_active = False
        await self.db.delete(oauth_account)
        
        user.oauth_providers = other_providers
        if user.oauth_last_login == provider.value:
            user.oauth_last_login = other_providers[0] if other_providers else None
        
        await self.db.commit()
        
        logger.info(f"🔓 {provider.value} unlinked from user: {user.email}")
        return True
    
    async def get_linked_accounts(self, user_id: str) -> list:
        stmt = select(OAuthAccount).where(
            OAuthAccount.user_id == user_id,
            OAuthAccount.is_active == True,
        )
        result = await self.db.execute(stmt)
        accounts = result.scalars().all()
        
        return [
            {
                "id": str(acc.id),
                "provider": acc.provider,
                "provider_email": acc.provider_email,
                "provider_username": acc.provider_username,
                "linked_at": acc.created_at.isoformat(),
                "last_used_at": acc.last_used_at.isoformat() if acc.last_used_at else None,
            }
            for acc in accounts
        ]


async def get_oauth_service(db: AsyncSession) -> OAuthService:
    return OAuthService(db)