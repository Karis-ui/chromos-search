import enum
from typing import Dict,List,Optional
from pydantic import BaseModel, Field, SecretStr
from enum import Enum
from app.core.config import settings


def _secret_value(value: Optional[SecretStr]) -> str:
    return value.get_secret_value() if value else ""

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
        google_client_id = settings.GOOGLE_CLIENT_ID or ""
        google_client_secret = _secret_value(settings.GOOGLE_CLIENT_SECRET)
        github_client_id = settings.GITHUB_CLIENT_ID or ""
        github_client_secret = _secret_value(settings.GITHUB_CLIENT_SECRET)

        return{
             OAuthProvider.google: OAuthProviderConfig(
                name="Google",
            client_id=google_client_id,
            client_secret=google_client_secret,
                authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
                token_url="https://oauth2.googleapis.com/token",
                userinfo_url="https://www.googleapis.com/oauth2/v3/userinfo",
                scopes=[
                    "openid",
                    "email",
                    "profile",
                ],
                redirect_uri=f"{self.callback_base}/google/callback",
                enabled=bool(google_client_id and google_client_secret),
                email_field="email",
                name_field="name",
                avatar_field="picture",
                id_field="sub",
            ),
            OAuthProvider.github: OAuthProviderConfig(
                name="GitHub",
                client_id=github_client_id,
                client_secret=github_client_secret,
                authorize_url="https://github.com/login/oauth/authorize",
                token_url="https://github.com/login/oauth/access_token",
                userinfo_url="https://api.github.com/user",
                scopes=[
                    "read:user",
                    "user:email",
                ],
                redirect_uri=f"{self.callback_base}/github/callback",
                enabled=bool(github_client_id and github_client_secret),
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

oauth_settings = OAuthSettings()
oath_settings = oauth_settings

__all__ = [
    "OAuthProvider",
    "OAuthSettings",
    "oauth_settings",
    "oath_settings",
]