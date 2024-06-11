import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Coordinates {
  lat: number;
  lon: number;
}

interface Bairro {
  id: string;
  bairro_name: string;
  coleta_type: string;
  inicio_coleta: string;
  dias_coleta: string[];
  coordinates: Coordinates[];
}

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapBairrosProps {
  bairros: Bairro[];
}

const MapBairros: React.FC<MapBairrosProps> = ({ bairros }) => {
  return (
    <MapContainer className='map-container' center={[-3.71722, -38.54333]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {bairros.map((bairro, index) => (
        <React.Fragment key={index}>
          {bairro.coordinates.length > 0 && (
            <Marker 
              position={[bairro.coordinates[0].lat, bairro.coordinates[0].lon]}
              icon={bairro.coleta_type === 'diurna' ? greenIcon : blueIcon}
            >
              <Popup>
                <strong>{bairro.bairro_name}</strong><br />
                Coleta: {bairro.coleta_type}<br />
                Início: {bairro.inicio_coleta}<br />
                Dias: {bairro.dias_coleta.join(', ')}
              </Popup>
            </Marker>
          )}
          {bairro.coordinates.length > 0 && (
            <Polygon 
              positions={bairro.coordinates.map(coord => [coord.lat, coord.lon])}
              color={bairro.coleta_type === 'diurna' ? 'green' : 'blue'}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapBairros;
