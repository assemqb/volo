from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user_schema import UserOut
from app.controllers.user_controller import get_user_profile, update_user_profile, delete_user_profile
from app.utils.security import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_own_profile(current_user: UserOut = Depends(get_current_active_user)):
    profile = await get_user_profile(current_user)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found.")
    return profile

@router.put("/me", response_model=UserOut)
async def update_profile(user_update: dict, current_user: UserOut = Depends(get_current_active_user)):
    updated_user = await update_user_profile(current_user, user_update)
    if not updated_user:
        raise HTTPException(status_code=400, detail="Update failed.")
    return updated_user

@router.delete("/me")
async def delete_profile(current_user: UserOut = Depends(get_current_active_user)):
    deleted = await delete_user_profile(current_user)
    if deleted:
        return {"detail": "User profile and associated data deleted successfully."}
    raise HTTPException(status_code=400, detail="Failed to delete profile.")
