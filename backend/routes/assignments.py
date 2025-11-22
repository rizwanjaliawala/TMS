from fastapi import APIRouter, HTTPException
from typing import List
from backend.database import db
from backend.models import Assignment
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Assignment)
async def create_assignment(assignment: Assignment):
    assignment_dict = assignment.dict(by_alias=True, exclude={"id"})
    result = await db.assignments.insert_one(assignment_dict)
    assignment.id = str(result.inserted_id)
    return assignment

@router.get("/", response_model=List[Assignment])
async def get_assignments():
    assignments = []
    async for assignment in db.assignments.find():
        assignment["id"] = str(assignment.pop("_id"))
        assignments.append(Assignment(**assignment))
    return assignments
