
from datetime import datetime, timezone


class RateLimitMitigationEngine:
    """
    Simulates rate limiting against synthetic traffic.
    Does not block real network connections.
    """

    def __init__(self, default_limit: int = 30):
        self.default_limit = default_limit
        self.enabled = False
        self.request_limit = default_limit

        self._last_result = {
            "enabled": False,
            "incoming_rps": 0,
            "allowed_rps": 0,
            "blocked_rps": 0,
            "mitigation_rate": 0.0,
            "timestamp": None,
        }

    def enable(self, request_limit: int = 30):
        if not 1 <= request_limit <= 100:
            raise ValueError("Request limit must be between 1 and 100.")

        self.request_limit = request_limit
        self.enabled = True

        return self.get_status()

    def disable(self):
        self.enabled = False
        self._last_result = {
            "enabled": False,
            "incoming_rps": 0,
            "allowed_rps": 0,
            "blocked_rps": 0,
            "mitigation_rate": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        return self.get_status()

    def mitigate(self, metrics: dict):
        incoming_rps = metrics.get("total_rps", 0)

        if not self.enabled:
            allowed_rps = incoming_rps
            blocked_rps = 0
        else:
            allowed_rps = min(incoming_rps, self.request_limit)
            blocked_rps = max(0, incoming_rps - self.request_limit)

        mitigation_rate = (
            (blocked_rps / incoming_rps) * 100
            if incoming_rps > 0
            else 0.0
        )

        self._last_result = {
            "enabled": self.enabled,
            "incoming_rps": incoming_rps,
            "allowed_rps": allowed_rps,
            "blocked_rps": blocked_rps,
            "mitigation_rate": round(mitigation_rate, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        return self._last_result.copy()

    def get_status(self):
        return {
            "enabled": self.enabled,
            "request_limit": self.request_limit,
            "last_result": self._last_result.copy(),
        }
