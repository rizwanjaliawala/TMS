from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from backend.routes import drivers, trucks, assignments, containers, reports
import os

app = FastAPI(title="Transport Management System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc), "type": type(exc).__name__},
    )

# Create uploads directory if not exists
# Vercel filesystem is read-only, use /tmp for temporary storage
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Get absolute path to frontend directory
# Assuming running from h:/Trans, frontend is at h:/Trans/frontend
FRONTEND_DIR = os.path.abspath("frontend")

# Static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")

# Routes
app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])
app.include_router(trucks.router, prefix="/api/trucks", tags=["Trucks"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(containers.router, prefix="/api/containers", tags=["Containers"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/api/health")
async def health_check():
    from backend.database import client
    try:
        # Ping the database
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.get("/")
async def root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.on_event("startup")
async def startup_event():
    pass
