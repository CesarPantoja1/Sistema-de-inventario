"""
Dependencias comunes para los endpoints de la API.
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.auth_service import AuthService
from app.services.category_service import CategoryService
from app.services.supplier_service import SupplierService
from app.services.product_service import ProductService
from app.services.inventory_service import InventoryService
from app.models.user import User

# OAuth2 scheme para autenticación con Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency para obtener el servicio de autenticación."""
    return AuthService(db)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service)
) -> User:
    """
    Dependency para obtener el usuario actual autenticado.

    Args:
        token: Token JWT del header Authorization
        auth_service: Servicio de autenticación

    Returns:
        Usuario autenticado

    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decodificar token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    # Obtener usuario
    user = auth_service.get_current_user(email)
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    return user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency para verificar que el usuario actual es admin.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario si es admin

    Raises:
        HTTPException: Si el usuario no es admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    """Dependency para obtener el servicio de categorías."""
    return CategoryService(db)


def get_supplier_service(db: Session = Depends(get_db)) -> SupplierService:
    """Dependency para obtener el servicio de proveedores."""
    return SupplierService(db)


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    """Dependency para obtener el servicio de productos."""
    return ProductService(db)


def get_inventory_service(db: Session = Depends(get_db)) -> InventoryService:
    """Dependency para obtener el servicio de inventario."""
    return InventoryService(db)
