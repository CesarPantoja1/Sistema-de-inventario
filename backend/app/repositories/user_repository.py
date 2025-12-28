"""
Repository para acceso a datos de usuarios.
Implementa el patrón Repository para abstraer las operaciones de BD.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Repository para operaciones CRUD de usuarios."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Obtener usuario por ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Obtener usuario por email."""
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_data: dict) -> User:
        """Crear un nuevo usuario."""
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user_id: int, user_data: dict) -> Optional[User]:
        """Actualizar un usuario existente."""
        user = self.get_by_id(user_id)
        if not user:
            return None

        for key, value in user_data.items():
            setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: int) -> bool:
        """Eliminar un usuario (soft delete)."""
        user = self.get_by_id(user_id)
        if not user:
            return False

        user.is_active = False
        self.db.commit()
        return True

    def exists_by_email(self, email: str) -> bool:
        """Verificar si existe un usuario con el email dado."""
        return self.db.query(User).filter(User.email == email).first() is not None
