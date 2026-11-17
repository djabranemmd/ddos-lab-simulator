
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "DDoS Lab Simulator"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"

    # Simulation safety limits
    MAX_SIMULATED_BOTS: int = 100
    MAX_REQUESTS_PER_SECOND: int = 100

    # Monitoring configuration
    MONITORING_INTERVAL: float = 1.0

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()