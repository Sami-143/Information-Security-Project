from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request

from db.database import user_collection
from models.document import Document
from utils.crypto import hash_data, verify_signature
from utils.asymmetricKeys import get_private_key
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import base64
import os
from datetime import datetime
from utils.rate_limiter import limiter
import time

router = APIRouter()

@router.post("/verify-doc")
@limiter.limit("5/minute")  # Allow max 5 logins per minute per IP
async def verify_signed_doc(
    request: Request,
    image: UploadFile = File(...),
    signature: str = Form(...),
    publicKey: str = Form(...)
):
    try:
        # Save the uploaded file temporarily
        temp_path = f"temp/{image.filename}"
        os.makedirs("temp", exist_ok=True)
        content = await image.read()
        with open(temp_path, "wb") as f:
            f.write(content)


        # Hash the file
        file_hash = hash_data(content)

        # Verify the signature using provided public key in PEM
        public_key_bytes = publicKey.encode()
        is_valid = verify_signature(file_hash, signature, public_key_bytes)

        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid signature. Verification failed.")
        
        # Save to MongoDB
        document = Document(
            filename=image.filename,
            file_hash=file_hash.hex(),
            signature=signature,
            public_key=publicKey,
            created_at=datetime.utcnow()
        )
        user_collection.insert_one(document.dict())

        # time.sleep(0.1)
        # os.remove(temp_path)
        return {"success": True, "message": "Signature verified. Document is authentic.", "doc_id": str(document.id)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")