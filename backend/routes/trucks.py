from fastapi import APIRouter, HTTPException
from typing import List
from backend.database import db
from backend.models import Truck, Incident, Repair
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Truck)
async def create_truck(truck: Truck):
    truck_dict = truck.dict(by_alias=True, exclude={"id"})
    result = await db.trucks.insert_one(truck_dict)
    truck.id = str(result.inserted_id)
    return truck

@router.get("/", response_model=List[Truck])
async def get_trucks():
    trucks = []
    async for truck in db.trucks.find():
        truck["id"] = str(truck.pop("_id"))
        trucks.append(Truck(**truck))
    return trucks

@router.put("/{truck_id}/mileage")
async def update_mileage(truck_id: str, mileage: float):
    result = await db.trucks.update_one({"_id": ObjectId(truck_id)}, {"$set": {"mileage": mileage}})
    if result.modified_count == 1:
        return {"message": "Mileage updated"}
    raise HTTPException(status_code=404, detail="Truck not found")

@router.post("/{truck_id}/incidents")
async def add_incident(truck_id: str, incident: Incident):
    print(f"DEBUG: Adding incident to truck {truck_id}: {incident}")
    try:
        result = await db.trucks.update_one(
            {"_id": ObjectId(truck_id)}, 
            {"$push": {"incidents": incident.dict()}}
        )
        print(f"DEBUG: Update result matched_count: {result.matched_count}, modified_count: {result.modified_count}")
        if result.modified_count == 1:
            return {"message": "Incident added"}
        raise HTTPException(status_code=404, detail=f"Truck {truck_id} not found or not modified")
    except Exception as e:
        print(f"DEBUG: Error adding incident: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{truck_id}/repairs")
async def add_repair(truck_id: str, repair: Repair):
    print(f"DEBUG: Adding repair to truck {truck_id}: {repair}")
    try:
        result = await db.trucks.update_one(
            {"_id": ObjectId(truck_id)}, 
            {"$push": {"repairs": repair.dict()}}
        )
        print(f"DEBUG: Update result matched_count: {result.matched_count}, modified_count: {result.modified_count}")
        if result.modified_count == 1:
            return {"message": "Repair added"}
        raise HTTPException(status_code=404, detail=f"Truck {truck_id} not found or not modified")
    except Exception as e:
        print(f"DEBUG: Error adding repair: {e}")
        raise HTTPException(status_code=500, detail=str(e))
