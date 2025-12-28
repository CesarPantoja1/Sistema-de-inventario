"""
Endpoints de autenticación.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.services.auth_service import AuthService
from app.api.deps import get_auth_service, get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Registrar un nuevo usuario.

    - **email**: Email único del usuario
    - **full_name**: Nombre completo
    - **password**: Contraseña (mínimo 6 caracteres)
    - **role**: Rol del usuario (admin, seller, warehouse_keeper)
    """
    return auth_service.register(user_data)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login de usuario (OAuth2 compatible).

    Retorna un token JWT para autenticación.

    - **username**: Email del usuario
    - **password**: Contraseña
    """
    return auth_service.login(email=form_data.username, password=form_data.password)


@router.post("/login/json", response_model=Token)
def login_json(
    credentials: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login de usuario con JSON.

    Alternativa al endpoint OAuth2 para frontends que prefieren JSON.

    - **email**: Email del usuario
    - **password**: Contraseña
    """
    return auth_service.login(email=credentials.email, password=credentials.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario autenticado actual.

    Requiere token JWT válido en el header Authorization.
    """
    return current_user
