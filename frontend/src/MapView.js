// src/MapView.js
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center)) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ center, data }) {
  const lat = data?.location?.lat ?? center[0];
  const lon = data?.location?.lon ?? center[1];
  const radiusMeters = data?.blast_radius_km ? Number(data.blast_radius_km) * 1000 : 0;

  return (
    <div className="map">
      <MapContainer center={center} zoom={8} style={{ height: "480px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={[lat, lon]} />
        {data && radiusMeters > 0 && (
          <Circle center={[lat, lon]} radius={radiusMeters}>
            <Popup>
              <div>
                <strong>Risk:</strong> {data.risk_level}<br/>
                <strong>Energy:</strong> {data.energy_megatons} MT<br/>
                <strong>Radius:</strong> {data.blast_radius_km} km
              </div>
            </Popup>
          </Circle>
        )}
      </MapContainer>
    </div>
  );
}
