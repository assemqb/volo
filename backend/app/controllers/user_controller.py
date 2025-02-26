from app.database.mongodb import get_db
from bson import ObjectId

async def get_user_profile(user):
    db = get_db()
    user_id = ObjectId(user.get("id") or user.get("_id"))
    profile = await db.users.find_one({"_id": user_id})
    if profile:
        profile["id"] = str(profile["_id"])
    return profile

async def update_user_profile(current_user, update_data: dict):
    db = get_db()
    user_id = ObjectId(current_user.get("id") or current_user.get("_id"))
    update_result = await db.users.update_one({"_id": user_id}, {"$set": update_data})
    if update_result.modified_count:
        updated_user = await db.users.find_one({"_id": user_id})
        updated_user["id"] = str(updated_user["_id"])
        return updated_user
    return None

async def delete_user_profile(user):
    db = get_db()
    user_id = ObjectId(user.get("id") or user.get("_id"))
    await db.registrations.delete_many({"user_id": str(user_id)})
    result = await db.users.delete_one({"_id": user_id})
    return result.deleted_count
