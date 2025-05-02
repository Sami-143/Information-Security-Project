# utils/auth.py

from jose import jwt, JWTError
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Header
from db.database import user_collection  # <-- this is your PyMongo users collection


SECRET_KEY = "sada apna is da project hai"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day token expiry

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        if token.startswith("Bearer "):
            token = token.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

async def get_current_user(authorization: str = Header(...)):
    token = authorization
    email = decode_token(token)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Optional: Convert dict to object-like access
    class CurrentUser:
        def __init__(self, user_dict):
            self.email = user_dict["email"]
            self.name = user_dict.get("name", "")
            self.role = user_dict.get("role", "user")

    return CurrentUser(user)
