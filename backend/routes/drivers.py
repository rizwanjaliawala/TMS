from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from backend.database import db
from backend.models import Driver
from bson import ObjectId
import shutil
import os

router = APIRouter()

@router.post("/", response_model=Driver)
async def create_driver(driver: Driver):
    driver_dict = driver.dict(by_alias=True, exclude={"id"})
    result = await db.drivers.insert_one(driver_dict)
    driver.id = str(result.inserted_id)
    return driver

@router.get("/", response_model=List[Driver])
async def get_drivers():
    drivers = []
    async for driver in db.drivers.find():
        driver["_id"] = str(driver.pop("_id"))
        drivers.append(Driver(**driver))
    return drivers

@router.get("/{driver_id}", response_model=Driver)
async def get_driver(driver_id: str):
    driver = await db.drivers.find_one({"_id": ObjectId(driver_id)})
    if driver:
        driver["id"] = str(driver.pop("_id"))
        return Driver(**driver)
    raise HTTPException(status_code=404, detail="Driver not found")

@router.put("/{driver_id}", response_model=Driver)
async def update_driver(driver_id: str, driver: Driver):
    driver_dict = driver.dict(by_alias=True, exclude={"id"})
    result = await db.drivers.update_one({"_id": ObjectId(driver_id)}, {"$set": driver_dict})
    if result.modified_count == 1:
        return await get_driver(driver_id)
    raise HTTPException(status_code=404, detail="Driver not found")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Import UPLOAD_DIR from main to avoid circular imports, or define it here
    # Ideally, define logic here. For Vercel, use /tmp
    upload_dir = "/tmp/uploads"
    file_location = f"{upload_dir}/{file.filename}"
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/uploads/{file.filename}"}
