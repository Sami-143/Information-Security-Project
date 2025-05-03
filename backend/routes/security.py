from fastapi import APIRouter, HTTPException, Request
import httpx
from pydantic import BaseModel
import os

router = APIRouter()

class RecaptchaRequest(BaseModel):
    token: str

@router.post("/verify-recaptcha")
async def verify_recaptcha(data: RecaptchaRequest, request: Request):
    secret = os.getenv("RECAPTCHA_SECRET_KEY")
    if not secret:
        raise HTTPException(status_code=500, detail="Recaptcha secret key not set.")

    verify_url = "https://www.google.com/recaptcha/api/siteverify"
    payload = {"secret": secret, "response": data.token}

    async with httpx.AsyncClient() as client:
        response = await client.post(verify_url, data=payload)

    result = response.json()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail="Recaptcha verification failed.")

    return {"success": True}
