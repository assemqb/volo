from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.registration_schema import RegistrationCreate, RegistrationOut
from app.utils.security import get_current_active_user
from app.controllers.event_controller import register_for_event, get_registrations_for_user
from app.schemas.user_schema import UserOut
from bson import ObjectId
from app.database.mongodb import get_db

router = APIRouter()

@router.post("/", response_model=RegistrationOut)
async def register_event(registration: RegistrationCreate, current_user: UserOut = Depends(get_current_active_user)):
    new_registration = await register_for_event(registration, current_user)
    if not new_registration:
        raise HTTPException(status_code=400, detail="Registration failed or already exists.")
    return new_registration

@router.get("/me", response_model=List[RegistrationOut])
async def my_registrations(current_user: UserOut = Depends(get_current_active_user)):
    registrations = await get_registrations_for_user(current_user)
    return registrations

@router.delete("/{registration_id}")
async def delete_registration(registration_id: str, current_user: UserOut = Depends(get_current_active_user)):
    db = get_db()
    try:
        reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid registration ID.")
    if not reg or reg.get("user_id") != str(current_user.get("id") or current_user.get("_id")):
        raise HTTPException(status_code=403, detail="Not authorized or registration not found.")
    result = await db.registrations.delete_one({"_id": ObjectId(registration_id)})
    if result.deleted_count == 1:
        return {"detail": "Registration deleted successfully."}
    raise HTTPException(status_code=400, detail="Failed to delete registration.")
