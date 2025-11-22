from motor.motor_asyncio import AsyncIOMotorClient
import os

# WARNING: Hardcoded credentials. DO NOT use in production if repo is public.
MONGO_URL = "mongodb+srv://rizwanjaliawala_db_user:2wbVTBj7XayiI2AU@tms.ddmz06v.mongodb.net/?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client.Trans
