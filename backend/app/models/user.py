from typing import List
from pydantic import BaseModel
from bson import ObjectId

class User(BaseModel):
    phone: str
    nickname: str
    full_name: str
    age: int
    languages: List[str]
    experience: str
    hashed_password: str
    role: str = "volunteer"

    def to_dict(self):
        return {
            "phone": self.phone,
            "nickname": self.nickname,
            "full_name": self.full_name,
            "age": self.age,
            "languages": self.languages,
            "experience": self.experience,
            "hashed_password": self.hashed_password,
            "role": self.role
        }
