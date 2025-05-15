from fastapi import APIRouter, Depends
from utils.permissions import require_role
from db.database import user_collection
from models.user import User
from bson import ObjectId

router = APIRouter()

def serialize_mongo_document(doc):
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc


@router.get("/users")
def get_all_users():
    users = list(user_collection.find({}))
    return [serialize_mongo_document(user) for user in users]
