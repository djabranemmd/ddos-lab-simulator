
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.simulation import engine
from app.mitigation.mitigation_engine import mitigation_engine

router = APIRouter(prefix="/mitigation", tags=["Mitigation"])


class MitigationConfig(BaseModel):
    request_limit: int = Field(default=30, ge=1, le=100)


@router.post("/enable")
async def enable_mitigation(config: MitigationConfig):
    try:
        result = mitigation_engine.enable(config.request_limit)
        return {
            "message": "Rate limiting enabled successfully.",
            "data": result,
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/disable")
async def disable_mitigation():
    result = mitigation_engine.disable()
    return {
        "message": "Rate limiting disabled successfully.",
        "data": result,
    }


@router.get("/status")
async def get_mitigation_status():
    return {
        "message": "Mitigation status retrieved successfully.",
        "data": mitigation_engine.get_status(),
    }


@router.post("/apply")
async def apply_mitigation():
    metrics = await engine.get_metrics()
    result = mitigation_engine.mitigate(metrics)

    return {
        "message": "Mitigation analysis completed.",
        "data": {
            "original_metrics": metrics,
            "mitigation": result,
        },
    }


@router.get("/analysis")
async def get_mitigation_analysis():
    return {
        "message": "Mitigation performance analysis retrieved successfully.",
        "data": mitigation_engine.get_analysis(),
    }


@router.delete("/analysis")
async def reset_mitigation_analysis():
    result = mitigation_engine.reset_statistics()
    return {
        "message": "Mitigation statistics reset successfully.",
        "data": result,
    }
