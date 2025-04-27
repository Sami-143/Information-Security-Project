from pymongo import MongoClient

MONGO_URL = "mongodb+srv://samiullahglotar420:shbo_7700@data.e4my1f1.mongodb.net/?retryWrites=true&w=majority&appName=Data"
client = MongoClient(MONGO_URL)

db = client.get_database("UserData")
user_collection = db.get_collection("users")
