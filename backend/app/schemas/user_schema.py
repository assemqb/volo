from pydantic import BaseModel
from typing import List

class UserCreate(BaseModel):
    phone: str
    nickname: str
    full_name: str
    age: int
    languages: List[str]
    experience: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class UserOut(BaseModel):
    id: str
    phone: str
    nickname: str
    full_name: str
    age: int
    languages: List[str]
    experience: str
    role: str
