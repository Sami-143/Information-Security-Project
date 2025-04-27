from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from models.user import User
from db.database import user_collection
from utils.auth import create_access_token, hash_password, verify_password
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserSignUp(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserSignUp):
    existing_user = user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)
    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": "user",         # Default role
        "is_verified": True     # Mark verified since OTP is not used
    }
    user_collection.insert_one(user_data)

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signin")
async def signin(user: UserSignIn):
    db_user = user_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# 🚀 New Google Sign-In Endpoint
@router.get("/auth/google")
async def google_auth():
    # For now just a dummy response
    return {"message": "Google Authentication endpoint is working!"}
