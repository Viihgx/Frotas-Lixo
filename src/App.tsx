import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './App.css';

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

interface Route {
  id: string;
  start_bairro: string;
  end_bairro: string;
  route: Coordinates[];
  startCoords: Coordinates;
  endCoords: Coordinates;
}

const App: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const startBairroRef = useRef<HTMLInputElement>(null);
  const endBairroRef = useRef<HTMLInputElement>(null);

  const fetchCoordinates = async (bairro: string): Promise<Coordinates | null> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${bairro},Fortaleza`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
  };

  const fetchRoutesFromDB = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/routes');
      const data: Route[] = response.data;
      const fetchedRoutes: Route[] = await Promise.all(data.map(async (route) => {
        const startCoords = await fetchCoordinates(route.start_bairro);
        const endCoords = await fetchCoordinates(route.end_bairro);
        return {
          ...route,
          startCoords: startCoords ? startCoords : { lat: 0, lon: 0 },
          endCoords: endCoords ? endCoords : { lat: 0, lon: 0 },
          route: route.route.map((coord: Coordinates) => ({
            lat: coord.lat,
            lon: coord.lon
          }))
        };
      }));
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error('Error fetching routes from DB:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoutesFromDB();
  }, [fetchRoutesFromDB]);

  const saveRouteToDB = async (startBairro: string, endBairro: string, route: Coordinates[]) => {
    try {
      const response = await axios.post('http://localhost:5000/api/routes', {
        start_bairro: startBairro,
        end_bairro: endBairro,
        route: route
      });
      console.log('Saved route to DB:', response.data);
    } catch (error) {
      console.error('Error saving route to DB:', error);
    }
  };

  const fetchRoute = async (start: Coordinates, end: Coordinates, startBairro: string, endBairro: string) => {
    const response = await fetch(
      `http://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?geometries=geojson`
    );
    const data = await response.json();
    if (data.routes.length > 0) {
      const routeCoordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lon: coord[0]
      }));
      const newRoute: Route = { 
        id: '', 
        start_bairro: startBairro, 
        end_bairro: endBairro, 
        route: routeCoordinates,
        startCoords: start,
        endCoords: end 
      };
      setRoutes(prevRoutes => [...prevRoutes, newRoute]);
      saveRouteToDB(startBairro, endBairro, routeCoordinates);
    }
  };

  const handleRouteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startBairro = startBairroRef.current?.value ?? '';
    const endBairro = endBairroRef.current?.value ?? '';

    const startCoords = await fetchCoordinates(startBairro);
    const endCoords = await fetchCoordinates(endBairro);

    if (startCoords && endCoords) {
      await fetchRoute(startCoords, endCoords, startBairro, endBairro);
      if (startBairroRef.current) startBairroRef.current.value = '';
      if (endBairroRef.current) endBairroRef.current.value = '';
    }
  };

  return (
    <div className='container'>
      <MapContainer className='map-container' center={[-3.71722, -38.54333]} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {routes.map((route, index) => (
          <React.Fragment key={index}>
            <Marker position={[route.startCoords.lat, route.startCoords.lon]}>
              <Popup>
                Origem: {route.start_bairro}
              </Popup>
            </Marker>
            <Marker position={[route.endCoords.lat, route.endCoords.lon]}>
              <Popup>
                Destino: {route.end_bairro}
              </Popup>
            </Marker>
            <Polyline positions={route.route.map(coord => [coord.lat, coord.lon])} color="blue" />
          </React.Fragment>
        ))}
      </MapContainer>
      <div className='box'>
      <form onSubmit={handleRouteSubmit}>
        <input type="text" name="startBairro" placeholder="Digite o bairro de origem" ref={startBairroRef} />
        <input type="text" name="endBairro" placeholder="Digite o bairro de destino" ref={endBairroRef} />
        <button type="submit">Adicionar Rota</button>
      </form>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bairro de Origem</th>
                <th>Bairro de Destino</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={index}>
                  <td>{route.start_bairro}</td>
                  <td>{route.end_bairro}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
      </div>
    </div>
  );
};

export default App;
