from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class EventBase(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    tasks: List[str]
    benefits: List[str]

class EventCreate(EventBase):
    criteria: Optional[str] = ""
    capacity: Optional[int] = 0

# New model for partial updates
class EventPatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    tasks: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    criteria: Optional[str] = None
    capacity: Optional[int] = None

    class Config:
        from_attributes = True  # For Pydantic v2. Use orm_mode = True for Pydantic v1

class EventOut(EventBase):
    id: str
    created_by: str
    criteria: Optional[str] = ""
    capacity: Optional[int] = 0
    volunteer_count: Optional[int] = 0
    registration_open: Optional[bool] = True

    class Config:
        from_attributes = True
