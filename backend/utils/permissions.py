from fastapi import Depends, HTTPException, status
from utils.auth import get_current_user
from models.user import User

def require_role(required_role: str):
    async def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires {required_role} role"
            )
        return current_user
    return role_dependency