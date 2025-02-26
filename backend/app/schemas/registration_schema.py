# registration_schema.py
from pydantic import BaseModel
from typing import Optional, List

class RegistrationBase(BaseModel):
    user_id: str
    event_id: str

# Restore or add this if it's missing
class RegistrationCreate(RegistrationBase):
    pass

class RegistrationOut(RegistrationBase):
    id: str
    status: str
    approval_status: Optional[str] = "pending"
    event_title: Optional[str] = None
    user_full_name: Optional[str] = None
    user_age: Optional[int] = None
    user_languages: Optional[List[str]] = None
    user_experience: Optional[str] = None

    class Config:
        from_attributes = True 