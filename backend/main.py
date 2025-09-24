# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from simulator import asteroid_impact_simulator # ✅ 1. Import your real simulator function

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 2. Use consistent names for the data model
class SimulationRequest(BaseModel):
    diameter: float
    velocity: float
    density: float
    lat: float
    lon: float

@app.post("/simulate")
def simulate(req: SimulationRequest):
    # ✅ 3. Call your real simulator function with the correct parameters
    impact_results = asteroid_impact_simulator(
        diameter_m=req.diameter,
        velocity_mps=req.velocity,
        density_kgm3=req.density,
        location={"lat": req.lat, "lng": req.lon}
    )
    
    # ✅ 4. Return the full results that the frontend needs
    return impact_results

@app.get("/")
def root():
    return {"message": "Asteroid Impact Simulator Backend is running!"}