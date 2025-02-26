from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import UserCreate, UserOut, UserLogin
from app.controllers.auth_controller import register_user, login_user

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    new_user = await register_user(user)
    if not new_user:
        raise HTTPException(status_code=400, detail="User registration failed or user already exists.")
    return new_user

@router.post("/login")
async def login(user: UserLogin):
    token = await login_user(user)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    return token
