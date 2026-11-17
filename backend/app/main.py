
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DDoS Lab Simulator",
    description="A controlled DDoS attack simulation and detection platform.",
    version="1.0.0",
)

# Allow local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "DDoS Lab Simulator API is running.",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ddos-lab-backend",
    }
