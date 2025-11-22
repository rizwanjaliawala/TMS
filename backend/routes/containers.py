from fastapi import APIRouter, HTTPException
from typing import List
from backend.database import db
from backend.models import Container, ContainerStatus
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Container)
async def create_container(container: Container):
    container_dict = container.dict(by_alias=True, exclude={"id"})
    result = await db.containers.insert_one(container_dict)
    container.id = str(result.inserted_id)
    return container

@router.get("/", response_model=List[Container])
async def get_containers():
    containers = []
    async for container in db.containers.find():
        container["id"] = str(container.pop("_id"))
        containers.append(Container(**container))
    return containers

@router.put("/{container_id}/status")
async def update_container_status(container_id: str, status: ContainerStatus):
    result = await db.containers.update_one(
        {"_id": ObjectId(container_id)}, 
        {"$set": {"status": status}}
    )
    if result.modified_count == 1:
        return {"message": "Status updated"}
    raise HTTPException(status_code=404, detail="Container not found")
