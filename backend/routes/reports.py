from fastapi import APIRouter
from backend.database import db
from backend.models import ContainerStatus, AssignmentType

router = APIRouter()

@router.get("/driver-performance")
async def driver_performance():
    # This is a simplified aggregation. In a real large-scale app, use MongoDB aggregation pipeline.
    report = []
    async for driver in db.drivers.find():
        driver_id = str(driver["_id"])
        
        # Count assignments
        assignments = await db.assignments.find({"driver_id": driver_id}).to_list(length=1000)
        drayage_count = sum(1 for a in assignments if a["type"] == AssignmentType.DRAYAGE)
        amazon_delivery_count = sum(1 for a in assignments if a["type"] == AssignmentType.AMAZON_DELIVERY)
        amazon_relay_count = sum(1 for a in assignments if a["type"] == AssignmentType.AMAZON_RELAY)
        
        # Count incidents/repairs for assigned truck (simplified: assumes current truck)
        truck_incidents = 0
        truck_repairs = 0
        if driver.get("assigned_truck_id"):
            truck = await db.trucks.find_one({"_id": driver["assigned_truck_id"]})
            if truck:
                truck_incidents = len(truck.get("incidents", []))
                truck_repairs = len(truck.get("repairs", []))

        report.append({
            "driver_name": driver["name"],
            "drayage_count": drayage_count,
            "amazon_delivery_count": amazon_delivery_count,
            "amazon_relay_count": amazon_relay_count,
            "truck_incidents": truck_incidents,
            "truck_repairs": truck_repairs
        })
    return report

@router.get("/vehicle-performance")
async def vehicle_performance():
    report = []
    async for truck in db.trucks.find():
        report.append({
            "vin": truck["vin"],
            "mileage": truck.get("mileage", 0),
            "incident_count": len(truck.get("incidents", [])),
            "repair_count": len(truck.get("repairs", []))
        })
    return report

@router.get("/empty-containers")
async def empty_containers():
    containers = []
    async for container in db.containers.find({"status": ContainerStatus.EMPTY}):
        containers.append({
            "container_number": container["container_number"],
            "ssl": container.get("ssl")
        })
    return containers
