from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.event_schema import EventCreate, EventOut, EventPatch
from app.controllers.event_controller import (
    get_events_by_admin, patch_event, delete_event, get_event_registrations,
    approve_registration, reject_registration
)
from app.schemas.registration_schema import RegistrationOut
from app.schemas.user_schema import UserOut
from app.utils.security import get_current_active_user
from app.controllers.event_controller import set_registration_status

router = APIRouter()

@router.get("/events", response_model=List[EventOut])
async def admin_list_events(current_user: UserOut = Depends(get_current_active_user)):
    events = await get_events_by_admin(current_user)
    return events

@router.patch("/events/{event_id}", response_model=EventOut)
async def admin_patch_event(event_id: str, event_patch: EventPatch, current_user: UserOut = Depends(get_current_active_user)):
    update_data = event_patch.dict(exclude_unset=True)
    updated = await patch_event(event_id, update_data, current_user)
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found or not authorized.")
    return updated

@router.delete("/events/{event_id}")
async def admin_delete_event(event_id: str, current_user: UserOut = Depends(get_current_active_user)):
    result = await delete_event(event_id, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="Event not found or not authorized.")
    return {"detail": "Event deleted successfully."}

@router.get("/events/{event_id}/registrations", response_model=List[RegistrationOut])
async def admin_event_registrations(event_id: str, current_user: UserOut = Depends(get_current_active_user)):
    regs = await get_event_registrations(event_id, current_user)
    return regs

@router.put("/registrations/{registration_id}/approve")
async def admin_approve_registration(registration_id: str, current_user: UserOut = Depends(get_current_active_user)):
    result = await approve_registration(registration_id, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="Registration not found or not authorized.")
    return {"detail": "Registration approved successfully."}

@router.put("/registrations/{registration_id}/reject")
async def admin_reject_registration(registration_id: str, current_user: UserOut = Depends(get_current_active_user)):
    result = await reject_registration(registration_id, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="Registration not found or not authorized.")
    return {"detail": "Registration rejected successfully."}

@router.put("/registrations/{registration_id}/reserve")
async def admin_reserve_registration(registration_id: str, current_user: UserOut = Depends(get_current_active_user)):
    # Similar logic to approve or reject, but sets "approval_status" to "reserve"
    result = await set_registration_status(registration_id, current_user, "reserve")
    if not result:
        raise HTTPException(status_code=404, detail="Registration not found or not authorized.")
    return {"detail": "Registration moved to reserve successfully."}



            