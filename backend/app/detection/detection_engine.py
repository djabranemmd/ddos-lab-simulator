
from datetime import datetime, timezone


class DDoSDetectionEngine:
    """
    Detects abnormal synthetic traffic using configurable thresholds.
    """

    def __init__(self):
        self.thresholds = {
            "total_rps": 25,
            "cpu_usage": 70.0,
            "response_time_ms": 150.0,
        }

        self._alerts = []
        self._max_alerts = 100

    def analyze(self, metrics: dict, store_alerts: bool = True):
        alerts = []

        if metrics.get("status") != "running":
            return {
                "detected": False,
                "severity": "none",
                "alerts": [],
                "analyzed_at": datetime.now(timezone.utc).isoformat(),
            }

        total_rps = metrics.get("total_rps", 0)
        attack_rps = metrics.get("attack_rps", 0)
        cpu_usage = metrics.get("cpu_usage", 0)
        response_time = metrics.get("response_time_ms", 0)

        if total_rps > self.thresholds["total_rps"]:
            alerts.append({
                "type": "high_traffic",
                "message": "Unusually high traffic rate detected.",
                "value": total_rps,
                "threshold": self.thresholds["total_rps"],
            })

        if attack_rps > 0:
            alerts.append({
                "type": "simulated_attack_traffic",
                "message": "Simulated attack traffic is present.",
                "value": attack_rps,
                "threshold": 0,
            })

        if cpu_usage > self.thresholds["cpu_usage"]:
            alerts.append({
                "type": "high_cpu_usage",
                "message": "High CPU usage detected.",
                "value": cpu_usage,
                "threshold": self.thresholds["cpu_usage"],
            })

        if response_time > self.thresholds["response_time_ms"]:
            alerts.append({
                "type": "high_response_time",
                "message": "Unusually high response time detected.",
                "value": response_time,
                "threshold": self.thresholds["response_time_ms"],
            })

        severity = self._calculate_severity(alerts)

        result = {
            "detected": len(alerts) > 0,
            "severity": severity,
            "alerts": alerts,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
        }

        if alerts and store_alerts:
            self.record_alert(result)

        return result

    def record_alert(self, result: dict):
        self._alerts.append(result)
        self._alerts = self._alerts[-self._max_alerts:]

    def _calculate_severity(self, alerts: list):
        alert_types = {alert["type"] for alert in alerts}

        if not alerts:
            return "none"

        if (
            "high_cpu_usage" in alert_types
            or "high_response_time" in alert_types
        ):
            return "critical"

        if "high_traffic" in alert_types:
            return "high"

        return "medium"

    def get_alerts(self, limit: int = 50):
        return self._alerts[-limit:]

    def clear_alerts(self):
        self._alerts.clear()
        return True
