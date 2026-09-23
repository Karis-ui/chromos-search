from app.core.security import verify_token
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.core.logger import logger
from app.core.exceptions import ChronosException
from app.core.oauth_config import oauth_settings, OAuthProvider
from app.core.security import get_current_user
from app.services.oauth_service import OAuthService
from app.models.domain import User

router = APIRouter(prefix="/oauth", tags=["OAuth"])

class OAuthProviderInfo(BaseModel):
    name: str
    id: str
    enabled:bool
    icon:str

class OAuthProviderResponse(BaseModel):
    providers:List[OAuthProviderInfo]

class OAuthCallbackResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict
    is_new_user: bool
    provider: str

class LinkAccountResponse(BaseModel):
    message:str
    provider:str
    provider_email:str

@router.get("/providers",response_model=OAuthProviderResponse)
async def get_providers():
    providers_info = []
    icons = {
        "google": "google",
        "github": "github",
        "microsoft": "microsoft",
        "apple": "apple",
        "linkedin": "linkedin",
    }
    for provider_id,provider_config in oauth_settings.providers.items():
        if provider_config.enabled:
            providers_info.append(
                OAuthProviderInfo(
                    name=provider_config.name,
                    id=provider_id,
                    enabled=provider_config.enabled,
                    icon=icons.get(provider_id,"unknown")
                )
            )
    return OAuthProviderResponse(providers=providers_info)

@router.get("/{provider}/authorize")
async def authorize(
    provider: OAuthProvider,
    request: Request,
    redirect_uri: Optional[str] = Query(None),
    link: bool = Query(False, description="Link to existing account"),
    db: AsyncSession = Depends(get_db),
):
    if not oauth_settings.is_provider_enabled(provider):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider {provider} is not enabled"
        )
    ip_addresses = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent","unknown")

    provider_instance = OAuthService(provider,request.url.hostname,settings.SECRET_KEY)

    if link:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer"):
            try:
                token = auth_header.split(" ")[1]
                payload = verify_token(token)
                if not payload:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authorization header missing or invalid"
                    )
                user_id = payload.get("sub")
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authorization header missing or invalid"
                    )
                provider_instance.set_user_id(user_id)
                service = OAuthService(db)
                try:
                    auth_url = await service.get_authorization_url(
                        provider=provider,redirect_uri=redirect_uri,link_user_id=user_id,ip_address=ip_addresses,user_agent=user_agent
                    )
                    return RedirectResponse(url=auth_url)
                finally:
                    await service.close()
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorization header missing or invalid"
                )
        redirect_uri = provider_instance.get_auth_url(redirect_uri,link=True)
    else:
        redirect_uri = provider_instance.get_auth_url(redirect_uri,link=False)

    logger.info(
        f"Initiating OAuth redirect for {provider.value} | "
        f"IP: {ip_addresses} | User-Agent: {user_agent}"
    )
    return RedirectResponse(url=redirect_uri)

@router.get("/{provider}/callback",response_model=OAuthCallbackResponse)
async def callback(
    provider: OAuthProvider,
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    if error:
        logger.warning(f"OAuth provider {provider} callback error: {error} - {error_description}")
        redirect_url = (
            f"{settings.FRONTEND_URL}/oauth/callback"
            f"?error={error}"
            f"&error_description={error_description or ''}"
            f"&provider={provider.value}"
        )
        return RedirectResponse(url=redirect_url)
    service = OAuthService(db)
    try:
        result = await service.complete_oauth_flow(provider=provider,code=code,state=state)
        user = result["user"]
        redirect_url = (
            f"{settings.FRONTEND_URL}/oauth/callback"
            f"?access_token={result['access_token']}"
            f"&refresh_token={result['refresh_token']}"
            f"&token_type={result['token_type']}"
            f"&expires_in={result['expires_in']}"
            f"&provider={provider.value}"
            f"&is_new_user={str(result['is_new_user']).lower()}"
        )
        logger.info(f"OAuth callback for {provider.value} | User ID: {user.id} | Email: {user.email} | New User: {result['is_new_user']}")
        return RedirectResponse(url=redirect_url)
    except ChronosException as e:
        logger.error(f"OAuth callback for {provider.value} error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"OAuth callback for {provider.value} error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete {provider.value} OAuth flow: {str(e)}"
        )

@router.post("/{provider}/link")
async def link_account(
    provider: OAuthProvider,
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not oauth_settings.is_provider_enabled(provider):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth provider '{provider.value}' is not enabled",
        )
    
    service = OAuthService(db)
    
    try:
        oauth_state = await service.validate_state(state, provider)
        if not oauth_state.link_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid linking state",
            )
        if str(oauth_state.link_user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="State does not match current user",
            )
        token_data = await service.exchange_code_for_tokens(provider, code)
        access_token = token_data["access_token"]
        raw_user_data = await service.fetch_user_info(provider, access_token)
        user_data = service.extract_user_data(provider, raw_user_data)
        oauth_account = await service.link_account(
            user_id=str(current_user.id),
            provider=provider,
            provider_user_id=user_data["provider_id"],
            provider_email=user_data["email"],
            provider_username=user_data.get("username"),
            tokens=token_data,
            profile_data=user_data.get("raw_data"),
        )
        
        return LinkAccountResponse(
            message=f"Successfully linked {provider.value} account",
            provider=provider.value,
            provider_email=user_data["email"],
        )
    
    finally:
        await service.close()

@router.delete("/{provider}/unlink")
async def unlink_account(
    provider: OAuthProvider,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OAuthService(db)
    
    try:
        await service.unlink_account(
            user_id=str(current_user.id),
            provider=provider,
        )
        
        return {
            "message": f"Successfully unlinked {provider.value} account",
            "provider": provider.value,
        }
    
    finally:
        await service.close()

@router.get("/linked-accounts")
async def get_linked_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OAuthService(db)
    
    try:
        accounts = await service.get_linked_accounts(str(current_user.id))
        
        return {
            "accounts": accounts,
            "has_password": current_user.has_password,
            "total": len(accounts),
        }
    
    finally:
        await service.close()