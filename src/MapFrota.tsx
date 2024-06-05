import React, { useState, useEffect, FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Configurar o ícone padrão do Leaflet
interface DefaultIconPrototype extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as DefaultIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Coordinates {
  lat: number;
  lon: number;
}

const App: React.FC = () => {
  const [startCoordinates, setStartCoordinates] = useState<Coordinates | null>(null);
  const [endCoordinates, setEndCoordinates] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<Coordinates[]>([]);

  useEffect(() => {
    fetchRouteFromDB();
  }, []);

  const fetchRouteFromDB = async () => {
    const response = await axios.get('http://localhost:5000/api/routes');
    const data = response.data[0];
    if (data) {
      setStartCoordinates(data.start_bairro);
      setEndCoordinates(data.end_bairro);
      setRoute(data.route);
    }
  };

  const saveRouteToDB = async (start: Coordinates, end: Coordinates, route: Coordinates[]) => {
    await axios.post('http://localhost:5000/api/routes', {
      start_bairro: start,
      end_bairro: end,
      route: route
    });
  };

  const fetchCoordinates = async (bairro: string): Promise<Coordinates | null> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${bairro},Fortaleza`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
  };

  const fetchRoute = async (start: Coordinates, end: Coordinates) => {
    const response = await fetch(
      `http://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?geometries=geojson`
    );
    const data = await response.json();
    if (data.routes.length > 0) {
      const routeCoordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lon: coord[0]
      }));
      setRoute(routeCoordinates);
      saveRouteToDB(start, end, routeCoordinates);
    }
  };

  const handleRouteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startBairro = (e.currentTarget.elements.namedItem('startBairro') as HTMLInputElement).value;
    const endBairro = (e.currentTarget.elements.namedItem('endBairro') as HTMLInputElement).value;

    const startCoords = await fetchCoordinates(startBairro);
    const endCoords = await fetchCoordinates(endBairro);

    if (startCoords && endCoords) {
      setStartCoordinates(startCoords);
      setEndCoordinates(endCoords);
      fetchRoute(startCoords, endCoords);
    }
  };

  return (
    <div>
      <form onSubmit={handleRouteSubmit}>
        <input type="text" name="startBairro" placeholder="Digite o bairro de origem" />
        <input type="text" name="endBairro" placeholder="Digite o bairro de destino" />
        <button type="submit">Adicionar Rota</button>
      </form>
      <MapContainer center={[-3.71722, -38.54333]} zoom={13} style={{ height: '600px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {startCoordinates && (
          <Marker position={[startCoordinates.lat, startCoordinates.lon]}>
            <Popup>
              Origem: {startCoordinates.lat}, {startCoordinates.lon}
            </Popup>
          </Marker>
        )}
        {endCoordinates && (
          <Marker position={[endCoordinates.lat, endCoordinates.lon]}>
            <Popup>
              Destino: {endCoordinates.lat}, {endCoordinates.lon}
            </Popup>
          </Marker>
        )}
        {route.length > 0 && (
          <Polyline positions={route.map(coord => [coord.lat, coord.lon])} color="blue" />
        )}
      </MapContainer>
    </div>
  );
};

export default App;
