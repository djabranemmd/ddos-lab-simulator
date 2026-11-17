
from fastapi import APIRouter, Query

from app.api.simulation import engine
from app.detection.monitoring_service import monitoring_service


router = APIRouter(
    prefix="/detection",
    tags=["Detection"],
)


@router.post("/analyze")
async def analyze_traffic():
    metrics = await engine.get_metrics()

    result = monitoring_service.detector.analyze(metrics)

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
    detector = monitoring_service.detector
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
    monitoring_service.detector.clear_alerts()

    return {
        "message": "All detection alerts cleared successfully.",
        "data": {
            "total_alerts": 0,
        },
    }


@router.post("/monitoring/start")
async def start_monitoring():
    status = await monitoring_service.start()

    return {
        "message": "Automatic monitoring started successfully.",
        "data": status,
    }


@router.post("/monitoring/stop")
async def stop_monitoring():
    status = await monitoring_service.stop()

    return {
        "message": "Automatic monitoring stopped successfully.",
        "data": status,
    }


@router.get("/monitoring/status")
async def get_monitoring_status():
    status = await monitoring_service.get_status()

    return {
        "message": "Monitoring status retrieved successfully.",
        "data": status,
    }
