import enum
from typing import Dict,List,Optional
from pydantic import BaseModel,Field
from enum import Enum
from app.core.config import settings

class OAuthProvider(str,Enum):
    github = 'github'
    google = 'google'
    linkedin = 'linkedin'
    microsoft = 'microsoft'
    apple = "apple"

class OAuthProviderConfig(BaseModel):
    name: str
    client_id: str
    client_secret: str
    authorize_url: str
    token_url: str
    userinfo_url: str
    scopes: List[str]
    redirect_uri: str
    enabled: bool = True
    email_field: str = "email"
    name_field: str = "name"
    avatar_field: str = "picture"
    id_field: str = "sub"

class OAuthSettings(BaseModel):

    @property
    def backend_url(self) -> str:
        return getattr(settings,'BACKEND_URL','http://localhost:8000')
    
    @property
    def frontend_url(self) -> str:
        return getattr(settings,'FRONTEND_URL','http://localhost:3000')
    
    @property
    def callback_base(self) -> str:
        return f"{self.backend_url}/api/v1/oauth"
    
    @property
    def providers(self) -> Dict[OAuthProvider,OAuthProviderConfig]:
        return{
             OAuthProvider.GOOGLE: OAuthProviderConfig(
                name="Google",
                client_id=getattr(settings, 'GOOGLE_CLIENT_ID', ''),
                client_secret=getattr(settings, 'GOOGLE_CLIENT_SECRET', ''),
                authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
                token_url="https://oauth2.googleapis.com/token",
                userinfo_url="https://www.googleapis.com/oauth2/v3/userinfo",
                scopes=[
                    "openid",
                    "email",
                    "profile",
                ],
                redirect_uri=f"{self.callback_base}/google/callback",
                enabled=bool(getattr(settings, 'GOOGLE_CLIENT_ID', '')),
                email_field="email",
                name_field="name",
                avatar_field="picture",
                id_field="sub",
            ),
            OAuthProvider.GITHUB: OAuthProviderConfig(
                name="GitHub",
                client_id=getattr(settings, 'GITHUB_CLIENT_ID', ''),
                client_secret=getattr(settings, 'GITHUB_CLIENT_SECRET', ''),
                authorize_url="https://github.com/login/oauth/authorize",
                token_url="https://github.com/login/oauth/access_token",
                userinfo_url="https://api.github.com/user",
                scopes=[
                    "read:user",
                    "user:email",
                ],
                redirect_uri=f"{self.callback_base}/github/callback",
                enabled=bool(getattr(settings, 'GITHUB_CLIENT_ID', '')),
                email_field="email",
                name_field="name",
                avatar_field="avatar_url",
                id_field="id",
            ),
        }
    def get_provider(self,provider:OAuthProvider) -> Optional[OAuthProviderConfig]:
        return self.providers.get(provider)
    
    def get_enabled_providers(self) -> List[OAuthProviderConfig]:
        return [p for p in self.providers.values() if p.enabled]

    def is_provider_enabled(self,provider:OAuthProvider) -> bool:
        conf=self.get_provider(provider)
        return conf is not None and conf.enabled
    
    def get_supported_providers(self) -> List[str]:
        return [p.name for p in self.get_enabled_providers()]
    
    def get_redirect_uri(self,provider:OAuthProvider) -> Optional[str]:
        conf=self.get_provider(provider)
        return conf.redirect_uri if conf else None
    
    def get_client_id(self,provider:OAuthProvider) -> Optional[str]:
        conf=self.get_provider(provider)
        return conf.client_id if conf else None

oath_settings = OAuthSettings()

__all__ = [
    "OAuthProvider",
    "OAuthSettings",
    "oath_settings",
]