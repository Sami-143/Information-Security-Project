from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")

class RecaptchaRequest(BaseModel):
    token: str

@router.post("/verify-recaptcha")
async def verify_recaptcha(data: RecaptchaRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": RECAPTCHA_SECRET_KEY,
                "response": data.token,
            },
        )

    result = response.json()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail="Invalid reCAPTCHA")

    return {"success": True, "message": "reCAPTCHA verified"}