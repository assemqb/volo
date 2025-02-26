import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

MONGO_DETAILS = os.getenv("MONGO_DETAILS")
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Token valid for 1 day
