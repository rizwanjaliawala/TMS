import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def verify():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.Trans
    
    print("Checking Drivers...")
    drivers = await db.drivers.find().to_list(length=100)
    print(f"Found {len(drivers)} drivers")
    for d in drivers:
        print(f"- {d.get('name')} ({d.get('_id')})")

    print("\nChecking Trucks...")
    trucks = await db.trucks.find().to_list(length=100)
    print(f"Found {len(trucks)} trucks")
    for t in trucks:
        print(f"- {t.get('vin')} ({t.get('_id')})")

    print("\nChecking Assignments...")
    assignments = await db.assignments.find().to_list(length=100)
    print(f"Found {len(assignments)} assignments")

if __name__ == "__main__":
    asyncio.run(verify())
