from fastapi import APIRouter, Depends
from utils.permissions import require_role
from db.database import user_collection
from models.user import User

router = APIRouter()

@router.get("/users", response_model=list[User])
async def get_all_users(current_user: User = Depends(require_role("admin"))):
    users = await user_collection.find(User)
    return users