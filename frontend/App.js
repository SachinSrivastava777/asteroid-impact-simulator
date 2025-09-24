import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';

function App() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ diameter: 50, velocity: 20000, density: 3000, lat: 26.8467, lon: 80.9462 });

  const simulate = async () => {
    const res = await axios.get("https://your-backend-url.onrender.com/simulate", { params: form });
    setData(res.data);
  };

  return (
    <div>
      <button onClick={simulate}>Simulate Impact</button>
      <MapContainer center={[form.lat, form.lon]} zoom={10} style={{ height: "500px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {data && (
          <Circle center={[form.lat, form.lon]} radius={data.blast_radius_km * 1000} color="red">
            <Popup>
              Risk: {data.risk_level}<br />
              Energy: {data.energy_megatons} MT<br />
              Radius: {data.blast_radius_km} km
            </Popup>
          </Circle>
        )}
      </MapContainer>
    </div>
  );
}

export default App;