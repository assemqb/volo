from app.database.mongodb import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

async def register_user(user_data: UserCreate):
    db = get_db()
    existing_user = await db.users.find_one({"phone": user_data.phone})
    if existing_user:
        return None
    hashed_password = get_password_hash(user_data.password)
    user = User(
        phone=user_data.phone,
        nickname=user_data.nickname,
        full_name=user_data.full_name,
        age=user_data.age,
        languages=user_data.languages,
        experience=user_data.experience,
        hashed_password=hashed_password,
        role="volunteer"
    )
    result = await db.users.insert_one(user.to_dict())
    new_user = await db.users.find_one({"_id": result.inserted_id})
    new_user["id"] = str(new_user["_id"])
    del new_user["hashed_password"]
    return new_user

async def login_user(login_data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"phone": login_data.phone})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        return None
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": str(user["_id"]), "role": user.get("role", "volunteer")},
        expires_delta=access_token_expires
    )
    return {"access_token": token, "token_type": "bearer"}
