# mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_DETAILS

client = None
_db = None  # Use a private variable for the DB instance

async def connect_to_mongo():
    global client, _db
    client = AsyncIOMotorClient(MONGO_DETAILS)
    _db = client.get_database("volunteer_db")  # Replace with your actual database name
    print("✅ Connected to MongoDB!")

def get_db():
    if _db is None:
        raise Exception("Database not initialized. Call connect_to_mongo() first.")
    return _db

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔴 MongoDB connection closed!")
