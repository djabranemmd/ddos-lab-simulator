
import asyncio
import random
from datetime import datetime, timezone

from app.core.config import settings


class TrafficSimulationEngine:
    """
    Generates synthetic network traffic metrics.
    No real network packets or HTTP requests are transmitted.
    """

    def __init__(self):
        self._task = None
        self._running = False

        self._metrics = {
            "status": "stopped",
            "mode": "normal",
            "legitimate_rps": 0,
            "attack_rps": 0,
            "total_rps": 0,
            "simulated_bots": 0,
            "cpu_usage": 0.0,
            "response_time_ms": 0.0,
            "last_updated": None,
        }

    async def start(
        self,
        mode: str = "normal",
        bots: int = 10,
        intensity: int = 2,
    ):
        if self._running:
            return await self.get_metrics()

        if mode not in ("normal", "attack"):
            raise ValueError("Mode must be 'normal' or 'attack'.")

        if not 1 <= bots <= settings.MAX_SIMULATED_BOTS:
            raise ValueError(
                f"Bots must be between 1 and {settings.MAX_SIMULATED_BOTS}."
            )

        if not 1 <= intensity <= 10:
            raise ValueError("Intensity must be between 1 and 10.")

        self._running = True

        self._metrics.update({
            "status": "running",
            "mode": mode,
            "simulated_bots": bots if mode == "attack" else 0,
        })

        self._task = asyncio.create_task(
            self._simulation_loop(mode, bots, intensity)
        )

        return await self.get_metrics()

    async def stop(self):
        self._running = False

        if self._task and not self._task.done():
            self._task.cancel()

            try:
                await self._task
            except asyncio.CancelledError:
                pass

        self._task = None

        self._metrics.update({
            "status": "stopped",
            "legitimate_rps": 0,
            "attack_rps": 0,
            "total_rps": 0,
            "simulated_bots": 0,
            "cpu_usage": 0.0,
            "response_time_ms": 0.0,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        })

        return await self.get_metrics()

    async def get_metrics(self):
        return self._metrics.copy()

    async def _simulation_loop(self, mode: str, bots: int, intensity: int):
        while True:
            legitimate_rps = random.randint(8, 15)

            if mode == "attack":
                attack_rps = min(
                    bots * intensity,
                    settings.MAX_REQUESTS_PER_SECOND,
                )
            else:
                attack_rps = 0

            total_rps = min(
                legitimate_rps + attack_rps,
                settings.MAX_REQUESTS_PER_SECOND,
            )

            cpu_usage = min(
                8 + (total_rps * 0.45) + random.uniform(0, 3),
                95.0,
            )

            response_time = (
                30 + (total_rps * 2.5) + random.uniform(0, 10)
            )

            self._metrics.update({
                "status": "running",
                "mode": mode,
                "legitimate_rps": legitimate_rps,
                "attack_rps": attack_rps,
                "total_rps": total_rps,
                "simulated_bots": bots if mode == "attack" else 0,
                "cpu_usage": round(cpu_usage, 2),
                "response_time_ms": round(response_time, 2),
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

            await asyncio.sleep(settings.MONITORING_INTERVAL)
