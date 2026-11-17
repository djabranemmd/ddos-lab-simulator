
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.simulation import router as simulation_router
from app.api.detection import router as detection_router
from app.detection.monitoring_service import monitoring_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    await monitoring_service.start()

    yield

    await monitoring_service.stop()


app = FastAPI(
    title=settings.APP_NAME,
    description="A controlled DDoS attack simulation and detection platform.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
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

app.include_router(
    simulation_router,
    prefix=settings.API_PREFIX,
)

app.include_router(
    detection_router,
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
