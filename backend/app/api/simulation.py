
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query
from app.engine.traffic_engine import TrafficSimulationEngine


router = APIRouter(
    prefix="/simulation",
    tags=["Simulation"],
)

# One shared engine instance for all API requests
engine = TrafficSimulationEngine()


class SimulationStartRequest(BaseModel):
    mode: str = Field(default="normal", pattern="^(normal|attack)$")
    bots: int = Field(default=10, ge=1, le=100)
    intensity: int = Field(default=2, ge=1, le=10)


@router.post("/start")
async def start_simulation(request: SimulationStartRequest):
    try:
        metrics = await engine.start(
            mode=request.mode,
            bots=request.bots,
            intensity=request.intensity,
        )

        return {
            "message": "Simulation started successfully.",
            "data": metrics,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/stop")
async def stop_simulation():
    metrics = await engine.stop()

    return {
        "message": "Simulation stopped successfully.",
        "data": metrics,
    }


@router.get("/status")
async def get_simulation_status():
    metrics = await engine.get_metrics()

    return {
        "message": "Simulation status retrieved successfully.",
        "data": metrics,
    }


@router.get("/history")
async def get_simulation_history(
    limit: int = Query(
        default=50,
        ge=1,
        le=300,
        description="Number of recent monitoring samples to retrieve.",
    ),
):
    history = await engine.get_history(limit=limit)

    return {
        "message": "Simulation history retrieved successfully.",
        "data": {
            "count": len(history),
            "samples": history,
        },
    }
