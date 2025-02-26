from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.event_schema import EventCreate, EventOut
from app.controllers.event_controller import create_event, get_events
from app.schemas.user_schema import UserOut
from app.utils.security import get_current_active_user

router = APIRouter()

@router.post("/", response_model=EventOut)
async def add_event(event: EventCreate, current_user: UserOut = Depends(get_current_active_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create events.")
    new_event = await create_event(event, current_user)
    return new_event

@router.get("/", response_model=List[EventOut])
async def list_events():
    events = await get_events()
    return events
