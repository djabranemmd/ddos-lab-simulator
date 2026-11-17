
from fastapi import APIRouter, Query

from app.api.simulation import engine
from app.detection.detection_engine import DDoSDetectionEngine


router = APIRouter(
    prefix="/detection",
    tags=["Detection"],
)

detector = DDoSDetectionEngine()


@router.post("/analyze")
async def analyze_traffic():
    metrics = await engine.get_metrics()

    result = detector.analyze(metrics)

    return {
        "message": "Traffic analysis completed.",
        "data": {
            "metrics": metrics,
            "detection": result,
        },
    }


@router.get("/alerts")
async def get_alerts(
    limit: int = Query(default=50, ge=1, le=100),
):
    alerts = detector.get_alerts(limit=limit)

    return {
        "message": "Detection alerts retrieved successfully.",
        "data": {
            "total_alerts": len(detector.get_alerts(limit=100)),
            "returned_alerts": len(alerts),
            "alerts": alerts,
        },
    }


@router.delete("/alerts")
async def clear_alerts():
    detector.clear_alerts()

    return {
        "message": "All detection alerts cleared successfully.",
        "data": {
            "total_alerts": 0,
        },
    }
