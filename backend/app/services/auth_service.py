"""
Servicio de autenticación.
Contiene la lógica de negocio para registro, login y gestión de tokens.
"""
from datetime import timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse, Token
from app.models.user import User


class AuthService:
    """Servicio de autenticación y gestión de usuarios."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> UserResponse:
        """
        Registrar un nuevo usuario.

        Args:
            user_data: Datos del usuario a registrar

        Returns:
            Usuario creado

        Raises:
            HTTPException: Si el email ya está registrado
        """
        # Verificar si el email ya existe
        if self.user_repo.exists_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )

        # Hash de la contraseña
        password_hash = get_password_hash(user_data.password)

        # Crear usuario
        user_dict = user_data.model_dump(exclude={"password"})
        user_dict["password_hash"] = password_hash

        user = self.user_repo.create(user_dict)

        return UserResponse.model_validate(user)

    def login(self, email: str, password: str) -> Token:
        """
        Autenticar usuario y generar token.

        Args:
            email: Email del usuario
            password: Contraseña del usuario

        Returns:
            Token de acceso

        Raises:
            HTTPException: Si las credenciales son inválidas
        """
        # Buscar usuario
        user = self.user_repo.get_by_email(email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verificar contraseña
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verificar que el usuario esté activo
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo"
            )

        # Crear token de acceso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")

    def get_current_user(self, email: str) -> Optional[User]:
        """
        Obtener usuario actual por email.

        Args:
            email: Email del usuario

        Returns:
            Usuario encontrado o None
        """
        return self.user_repo.get_by_email(email)
