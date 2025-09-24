// frontend/src/App.js

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; 
import L from 'leaflet';

// Data for famous impact events
const famousImpacts = [
  { 
    name: 'Chelyabinsk (Russia, 2013)', 
    data: { diameter: 20, velocity: 19000, density: 3300, lat: 54.98, lon: 61.37 } 
  },
  { 
    name: 'Tunguska (Siberia, 1908)', 
    data: { diameter: 60, velocity: 25000, density: 1000, lat: 60.91, lon: 101.95 } 
  },
  {
    name: 'Barringer Crater (USA, 50k BC)',
    data: { diameter: 50, velocity: 12800, density: 7800, lat: 35.02, lon: -111.02 }
  },
  {
    name: 'Hoba Meteorite (Namibia, 80k BC)',
    data: { diameter: 3, velocity: 10000, density: 7800, lat: -19.58, lon: 17.93 }
  },
  {
    name: 'Manicouagan (Canada, 214M BC)',
    data: { diameter: 5000, velocity: 17000, density: 3000, lat: 51.38, lon: -68.70 }
  },
  { 
    name: 'Chicxulub (Mexico, 66M BC)', 
    data: { diameter: 10000, velocity: 20000, density: 2700, lat: 21.40, lon: -89.51 } 
  }
];

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapLegend({ layers }) {
  if (!layers || layers.length === 0) return null;
  return (
    <div className="legend">
      <h4>Impact Zones</h4>
      {layers.map((layer, index) => (
        <div key={index}>
          <i style={{ background: layer.color, opacity: 0.7 }}></i>
          <span>{layer.tooltip}</span>
        </div>
      ))}
    </div>
  );
}

function LocationSelector({ location, setLocation }) {
  const map = useMapEvents({
    click(e) {
      setLocation(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return location === null ? null : (
    <Marker position={location}>
      <Popup>Selected Impact Location</Popup>
    </Marker>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ diameter: 50, velocity: 20000, density: 3000, lat: 28.7041, lon: 77.1025 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const simulate = useCallback(async (simulationData) => {
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${apiUrl}/simulate`, simulationData);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching simulation data:", error);
      setError("Failed to run simulation. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault(); 
    simulate(form);
  };

  const handleLocationSelect = useCallback((latlng) => {
    setForm(prevForm => ({ ...prevForm, lat: latlng.lat, lon: latlng.lng }));
  }, []);

  const handlePresetClick = (presetData) => {
    setForm(presetData);
  };

  useEffect(() => {
    if (form && form.lat && form.lon) {
      simulate(form);
    }
  }, [form, simulate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: parseFloat(value) || 0 }));
  };

  const impactLayers = data && data.location && data.blast_radius_km ? [
    { radius: data.blast_radius_km * 1000, color: 'red', fillColor: '#f03', tooltip: 'Blast Radius' },
    { radius: data.blast_radius_km * 1.5 * 1000, color: 'orange', fillColor: '#f96', tooltip: 'Damage Zone' },
    { radius: data.blast_radius_km * 2.5 * 1000, color: 'yellow', fillColor: '#fc0', tooltip: 'Effect Zone' }
  ] : [];

  const selectedPosition = [form.lat, form.lon];

  return (
    <div className="app">
      <header>
        <h1>☄️ Asteroid Impact Simulator (2D Map)</h1>
      </header>
      
      <div className="app-layout">
        
        <div className="main-content">
          <form className="form" onSubmit={handleSubmit}>
            <label>Diameter (m): <input type="number" name="diameter" value={form.diameter} onChange={handleInputChange} /></label>
            <label>Velocity (m/s): <input type="number" name="velocity" value={form.velocity} onChange={handleInputChange} /></label>
            <label>Density (kg/m³): <input type="number" name="density" value={form.density} onChange={handleInputChange} /></label>
            <label>Latitude: <input type="number" name="lat" value={form.lat} readOnly /></label>
            <label>Longitude: <input type="number" name="lon" value={form.lon} readOnly /></label>
            <button type="submit" disabled={loading}>
              {loading ? 'Simulating...' : 'Run Manual Simulation'}
            </button>
          </form>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="map-container">
            <MapContainer center={selectedPosition} zoom={7} style={{ height: "600px", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector location={selectedPosition} setLocation={handleLocationSelect} />
              {impactLayers.map((layer, index) => (
                <Circle 
                  key={index}
                  center={[data.location.lat, data.location.lng]} 
                  radius={layer.radius} 
                  pathOptions={{ color: layer.color, fillColor: layer.fillColor, fillOpacity: 0.4, weight: 2 }}
                >
                  <Popup>
                    {layer.tooltip} ({Math.round(layer.radius/1000)} km radius)<br/>
                    {index === 0 && (
                      <>
                        <b>Risk:</b> {data.risk_level}<br />
                        <b>Energy:</b> {data.energy_megatons} MT
                      </>
                    )}
                  </Popup>
                </Circle>
              ))}
              <MapLegend layers={impactLayers} />
            </MapContainer>
          </div>
        </div>

        <div className="sidebar">
          <h3>Famous Impacts</h3>
          {famousImpacts.map(impact => (
            <button key={impact.name} onClick={() => handlePresetClick(impact.data)}>
              {impact.name}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className="results">
          <h3>Simulation Results:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;