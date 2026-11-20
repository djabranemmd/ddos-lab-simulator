
from datetime import datetime, timezone


class RateLimitMitigationEngine:
    """
    Simulates rate limiting against synthetic traffic.
    No real network connections are blocked.
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

        self._statistics = {
            "total_samples": 0,
            "protected_samples": 0,
            "protected_incoming_rps_sum": 0,
            "protected_allowed_rps_sum": 0,
            "protected_blocked_rps_sum": 0,
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
        incoming_rps = max(0, metrics.get("total_rps", 0))

        if self.enabled:
            allowed_rps = min(incoming_rps, self.request_limit)
            blocked_rps = max(0, incoming_rps - self.request_limit)
        else:
            allowed_rps = incoming_rps
            blocked_rps = 0

        mitigation_rate = (
            (blocked_rps / incoming_rps) * 100
            if incoming_rps > 0 else 0.0
        )

        result = {
            "enabled": self.enabled,
            "incoming_rps": incoming_rps,
            "allowed_rps": allowed_rps,
            "blocked_rps": blocked_rps,
            "mitigation_rate": round(mitigation_rate, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        self._last_result = result
        self._statistics["total_samples"] += 1

        if self.enabled:
            self._statistics["protected_samples"] += 1

            self._statistics["protected_incoming_rps_sum"] += incoming_rps
            self._statistics["protected_allowed_rps_sum"] += allowed_rps
            self._statistics["protected_blocked_rps_sum"] += blocked_rps

        return result.copy()

    def get_analysis(self):
        stats = self._statistics
        samples = stats["protected_samples"]

        if samples > 0:
            avg_incoming = (
                stats["protected_incoming_rps_sum"] / samples
            )
            avg_allowed = (
                stats["protected_allowed_rps_sum"] / samples
            )
            avg_blocked = (
                stats["protected_blocked_rps_sum"] / samples
            )
        else:
            avg_incoming = 0
            avg_allowed = 0
            avg_blocked = 0

        total_incoming = stats["protected_incoming_rps_sum"]
        total_allowed = stats["protected_allowed_rps_sum"]
        total_blocked = stats["protected_blocked_rps_sum"]

        overall_rate = (
            (total_blocked / total_incoming) * 100
            if total_incoming > 0 else 0.0
        )

        return {
            "total_samples": stats["total_samples"],
            "protected_samples": samples,

            "average_incoming_rps": round(avg_incoming, 2),
            "average_allowed_rps": round(avg_allowed, 2),
            "average_blocked_rps": round(avg_blocked, 2),

            "protected_incoming_rps_sum": total_incoming,
            "protected_allowed_rps_sum": total_allowed,
            "protected_blocked_rps_sum": total_blocked,

            "overall_mitigation_rate": round(overall_rate, 2),
            "current_limit": self.request_limit,
            "mitigation_enabled": self.enabled,
        }

    def reset_statistics(self):
        self._statistics = {
            "total_samples": 0,
            "protected_samples": 0,
            "protected_incoming_rps_sum": 0,
            "protected_allowed_rps_sum": 0,
            "protected_blocked_rps_sum": 0,
        }

        return self.get_analysis()

    def get_status(self):
        return {
            "enabled": self.enabled,
            "request_limit": self.request_limit,
            "last_result": self._last_result.copy(),
            "analysis": self.get_analysis(),
        }


mitigation_engine = RateLimitMitigationEngine()
