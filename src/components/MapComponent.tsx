/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '../types';

// Fix Leaflet icons issues in Vite
// We use custom icons for everything, so we can just reset the default icon to something safe or ignore it
// but to be safe for any default markers:
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
  userLocation: [number, number] | null;
  defaultCenter: [number, number];
}

const IncidentMarker = ({ incident, onClick }: { incident: Incident, onClick: () => void, key?: string }) => {
  const color = incident.severity === 'high' ? '#ef4444' : '#f59e0b';
  const confidenceColor = incident.confidence === 'disputed' ? '#6b7280' : color;
  
  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 14px; 
        height: 14px; 
        background: ${confidenceColor}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 0 8px ${confidenceColor}aa;
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  return (
    <>
      <Circle
        center={[incident.lat, incident.lng]}
        pathOptions={{
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0.2,
          dashArray: incident.confidence === 'pending' ? '5, 5' : undefined
        }}
        radius={60}
      />
      <Marker 
        position={[incident.lat, incident.lng]} 
        icon={customIcon}
        eventHandlers={{
          click: onClick
        }}
      />
    </>
  );
};

export default function MapComponent({ incidents, onIncidentClick, userLocation, defaultCenter }: MapComponentProps) {
  const [center] = useState<[number, number]>(defaultCenter);

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-location-dot"></div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  return (
    <div id="map-container" className="absolute inset-0 z-0 h-full w-full">
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} />
        )}

        {incidents.map((incident) => (
          <IncidentMarker 
            key={incident.id} 
            incident={incident} 
            onClick={() => onIncidentClick(incident)}
          />
        ))}
      </MapContainer>
    </div>
  );
}
