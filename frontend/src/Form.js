// src/Form.js
import React from "react";

export default function SimForm({ form, setForm, simulate, loading }) {
  return (
    <div className="form">
      <label>Latitude:
        <input value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} />
      </label>
      <label>Longitude:
        <input value={form.lon} onChange={e => setForm({...form, lon: e.target.value})} />
      </label>
      <label>Diameter (m):
        <input value={form.diameter_m} onChange={e => setForm({...form, diameter_m: e.target.value})} />
      </label>
      <label>Velocity (m/s):
        <input value={form.velocity_mps} onChange={e => setForm({...form, velocity_mps: e.target.value})} />
      </label>
      <label>Density (kg/m³):
        <input value={form.density_kgm3} onChange={e => setForm({...form, density_kgm3: e.target.value})} />
      </label>
      <button onClick={simulate} disabled={loading}>
        {loading ? "Simulating…" : "Simulate Impact"}
      </button>
    </div>
  );
}
