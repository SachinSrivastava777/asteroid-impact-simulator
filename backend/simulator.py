# simulator.py
import math

def asteroid_impact_simulator(diameter_m, velocity_mps, density_kgm3, location=None):
    """
    Basic physical approximations:
      - volume of a sphere
      - mass = volume * density
      - kinetic energy = 0.5 * m * v^2
      - convert energy to megatons (1 megaton TNT = 4.184e15 J)
      - estimate blast radius (simple scaling)
    """
    # safe guards
    diameter_m = max(float(diameter_m), 0.0)
    velocity_mps = max(float(velocity_mps), 0.0)
    density_kgm3 = float(density_kgm3)

    volume = (4.0/3.0) * math.pi * (diameter_m / 2.0) ** 3
    mass = volume * density_kgm3
    energy_joules = 0.5 * mass * velocity_mps ** 2
    energy_megatons = energy_joules / 4.184e15
    # heuristic blast radius (km) — similar to the guide screenshot
    blast_radius_km = 0.1 * (energy_joules / 1e12) ** (1.0/3.0) if energy_joules > 0 else 0.0

    if energy_megatons < 1:
        risk = "Low"
    elif energy_megatons < 10:
        risk = "Moderate"
    else:
        risk = "High"

    return {
        "location": location,
        "mass_kg": round(mass, 2),
        "energy_joules": round(energy_joules, 2),
        "energy_megatons": round(energy_megatons, 6),
        "blast_radius_km": round(blast_radius_km, 3),
        "risk_level": risk
    }
