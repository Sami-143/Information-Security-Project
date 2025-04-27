# routes/google_auth.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import requests
import os
from urllib.parse import urlencode
from db.database import user_collection
from utils.auth import create_access_token

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

@router.get("/auth/google")
async def google_login():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": REDIRECT_URI,
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code not found in request.")

    # Exchange code for access token
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    token_response = requests.post(token_url, data=data)
    token_json = token_response.json()
    access_token = token_json.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to retrieve access token.")

    # Retrieve user info
    userinfo_response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    user_info = userinfo_response.json()

    if not user_info.get("email"):
        raise HTTPException(status_code=400, detail="Failed to retrieve user information.")

    email = user_info["email"]
    name = user_info.get("name", "")
    given_name = user_info.get("given_name", "")
    family_name = user_info.get("family_name", "")
    picture = user_info.get("picture", "")

    # Find or create user
    user = user_collection.find_one({"email": email})
    if not user:
        user = {
            "firstName": given_name,
            "lastName": family_name,
            "name": name,
            "email": email,
            "profilePic": picture,
            "userRole": "admin",
            "is_verified": True
        }
        user_collection.insert_one(user)

    # Create JWT Token
    jwt_token = create_access_token({"sub": email})

    # Build response
    response_data = {
        "message": "success",
        "token": jwt_token,
        "user": {
            "firstName": user.get("firstName", ""),
            "lastName": user.get("lastName", ""),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "userRole": user.get("userRole", "user"),
        }
    }

    return JSONResponse(content=response_data)