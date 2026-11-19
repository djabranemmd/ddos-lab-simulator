
import asyncio
import time
from datetime import datetime, timezone

from app.api.simulation import engine
from app.detection.detection_engine import DDoSDetectionEngine
from app.mitigation.mitigation_engine import mitigation_engine


class AutomaticMonitoringService:
    def __init__(self):
        self.detector = DDoSDetectionEngine()
        self._task = None
        self._running = False
        self._analyzed_samples = 0
        self._detected_samples = 0
        self._last_analysis = None
        self._last_mitigation = None
        self._last_alert_signature = None
        self._last_alert_time = 0.0
        self._alert_cooldown = 10.0

    async def start(self):
        if self._running:
            return await self.get_status()

        self._running = True
        self._task = asyncio.create_task(self._monitor_loop())
        return await self.get_status()

    async def stop(self):
        self._running = False

        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

        self._task = None
        return await self.get_status()

    async def get_status(self):
        return {
            "monitoring": "running" if self._running else "stopped",
            "analyzed_samples": self._analyzed_samples,
            "detected_samples": self._detected_samples,
            "last_analysis": self._last_analysis,
            "last_mitigation": self._last_mitigation,
        }

    async def _monitor_loop(self):
        while True:
            metrics = await engine.get_metrics()

            if metrics.get("status") == "running":
                now = datetime.now(timezone.utc).isoformat()

                # 1. Analyze incoming synthetic traffic.
                result = self.detector.analyze(
                    metrics,
                    store_alerts=False,
                )

                self._analyzed_samples += 1
                self._last_analysis = now

                # 2. Apply simulated rate limiting automatically.
                mitigation_result = mitigation_engine.mitigate(metrics)
                self._last_mitigation = mitigation_result

                # 3. Store detection alerts with a cooldown.
                if result["detected"]:
                    self._detected_samples += 1

                    signature = tuple(sorted(
                        alert["type"] for alert in result["alerts"]
                    ))

                    current_time = time.monotonic()

                    should_store = (
                        signature != self._last_alert_signature
                        or current_time - self._last_alert_time
                        >= self._alert_cooldown
                    )

                    if should_store:
                        self.detector.record_alert(result)
                        self._last_alert_signature = signature
                        self._last_alert_time = current_time
                else:
                    self._last_alert_signature = None

            await asyncio.sleep(1)


monitoring_service = AutomaticMonitoringService()
