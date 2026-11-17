
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.simulation import router as simulation_router


app = FastAPI(
    title=settings.APP_NAME,
    description="A controlled DDoS attack simulation and detection platform.",
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(
    simulation_router,
    prefix=settings.API_PREFIX,
)


@app.get("/")
async def root():
    return {
        "message": f"{settings.APP_NAME} API is running.",
        "status": "online",
        "version": settings.APP_VERSION,
    }


@app.get(f"{settings.API_PREFIX}/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ddos-lab-backend",
    }
