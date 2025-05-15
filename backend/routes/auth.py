# routes/auth.py

from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from models.user import User
from db.database import user_collection
from utils.auth import create_access_token, hash_password, verify_password
from pydantic import BaseModel, EmailStr

# ✨ New Imports for OTP and Email
from utils.send_email import send_email, EmailSendError
from utils.rate_limiter import limiter
import random
from datetime import datetime, timedelta

router = APIRouter()

class UserSignUp(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

# ✨ New models for OTP Verification
class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

@router.post("/signup")
async def signup(user: UserSignUp):
    existing_user = user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    # ✨ New changes for OTP and Email ✨
    otp = f"{random.randint(100000, 999999)}"
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": "user",       
        "is_verified": False,   
        "otp_code": otp,
        "otp_expires_at": otp_expiry
    }
    user_collection.insert_one(user_data)
    print(user)
    try:
        await send_email(
            to=user.email,
            subject="Verify your Email Address",
            body=f"Your OTP code is {otp}. It will expire in 10 minutes."
        )
    except EmailSendError:
        user_collection.delete_one({"email": user.email})
        raise HTTPException(status_code=500, detail="Failed to send verification email.")

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "message": "Signup successful. OTP sent to email.", "user": {"email": user.email, "role": "user"}}

@router.post("/signin")
async def signin(user: UserSignIn):
    db_user = user_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not db_user.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified. Please verify OTP.")

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "user": {
            "email": user.email,
            "role": db_user["role"] if db_user else None,
        }}

# ✨ New API: Verify OTP
@router.post("/verify-email")
async def verify_email(data: OtpVerifyRequest):
    db_user = user_collection.find_one({"email": data.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.get("is_verified", False):
        return {"message": "Email already verified."}

    if db_user["otp_code"] != data.otp_code or datetime.utcnow() > db_user["otp_expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    user_collection.update_one(
        {"email": data.email},
        {"$set": {"is_verified": True}, "$unset": {"otp_code": "", "otp_expires_at": ""}}
    )

    return {"message": "Email verified successfully."}

# ✨ New API: Resend OTP
@router.post("/resend-otp")
async def resend_otp(data: ResendOtpRequest):
    db_user = user_collection.find_one({"email": data.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Email already verified.")

    new_otp = f"{random.randint(100000, 999999)}"
    new_expiry = datetime.utcnow() + timedelta(minutes=10)

    user_collection.update_one(
        {"email": data.email},
        {"$set": {"otp_code": new_otp, "otp_expires_at": new_expiry}}
    )

    try:
        await send_email(
            to=data.email,
            subject="Your New Verification Code",
            body=f"Your new OTP code is {new_otp}. It will expire in 10 minutes."
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to resend OTP email.")

    return {"message": "New OTP sent successfully."}

@router.post("/make-admin")
async def make_admin(data: UserSignUp):
    existing_user = user_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(data.password)

    user_data = {
        "name": data.name,
        "email": data.email,
        "password": hashed_password,
        "role": "admin",
        "is_verified": True,
        "otp_code": None,
        "otp_expires_at": None
    }

    user_collection.insert_one(user_data)
    return {"message": "Admin user created successfully."}