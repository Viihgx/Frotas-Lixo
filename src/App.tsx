import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Select, { MultiValue } from 'react-select';
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

interface Bairro {
  id: string;
  bairro_name: string;
  coleta_type: string;
  inicio_coleta: string;
  dias_coleta: string[];
  coordinates: Coordinates[];
}

interface ApiBairro {
  id: string;
  bairro_name: string;
  coleta_type: string;
  inicio_coleta: string;
  dias_coleta: string;
  coordinates: Coordinates[];
}

const greenIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-green-icon'
});

const blueIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-blue-icon'
});


const App: React.FC = () => {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [filteredBairros, setFilteredBairros] = useState<Bairro[]>([]);
  const [coletaTypeFilter, setColetaTypeFilter] = useState<string>('');
  const bairroNameRef = useRef<HTMLInputElement>(null);
  const coletaTypeRef = useRef<HTMLSelectElement>(null);
  const inicioColetaRef = useRef<HTMLSelectElement>(null);
  const [selectedDias, setSelectedDias] = useState<{ label: string, value: string }[]>([]);

  const diasDaSemana = [
    { value: 'Segunda', label: 'Segunda' },
    { value: 'Terça', label: 'Terça' },
    { value: 'Quarta', label: 'Quarta' },
    { value: 'Quinta', label: 'Quinta' },
    { value: 'Sexta', label: 'Sexta' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' }
  ];

  const fetchCoordinates = async (bairro: string): Promise<Coordinates | null> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${bairro},Fortaleza`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
  };

  const fetchBairrosFromDB = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bairros');
      const data: ApiBairro[] = response.data;
      const fetchedBairros: Bairro[] = data.map((bairro) => ({
        ...bairro,
        dias_coleta: bairro.dias_coleta.split(',').map(dia => dia.trim())
      }));
      setBairros(fetchedBairros);
      setFilteredBairros(fetchedBairros);
    } catch (error) {
      console.error('Error fetching bairros from DB:', error);
    }
  }, []);

  useEffect(() => {
    fetchBairrosFromDB();
  }, [fetchBairrosFromDB]);

  const saveBairroToDB = async (bairro: Bairro) => {
    try {
      const response = await axios.post('http://localhost:5000/api/bairros', {
        ...bairro,
        dias_coleta: bairro.dias_coleta.join(', ')
      });
      const savedBairro: ApiBairro = response.data[0];
      const coordinates = await fetchCoordinates(savedBairro.bairro_name);
      if (coordinates) {
        const newBairro: Bairro = {
          ...savedBairro,
          coordinates: [coordinates],
          dias_coleta: savedBairro.dias_coleta.split(',').map(dia => dia.trim())
        };
        setBairros(prevBairros => [...prevBairros, newBairro]);
        setFilteredBairros(prevBairros => [...prevBairros, newBairro]);
      }
      console.log('Saved bairro to DB:', response.data);
    } catch (error) {
      console.error('Error saving bairro to DB:', error);
    }
  };

  const handleBairroSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bairro_name = bairroNameRef.current?.value ?? '';
    const coleta_type = coletaTypeRef.current?.value ?? '';
    const inicio_coleta = inicioColetaRef.current?.value ?? '';
    const dias_coleta = selectedDias.map(option => option.value);

    const newBairro: Bairro = { id: '', bairro_name, coleta_type, inicio_coleta, dias_coleta, coordinates: [] };
    await saveBairroToDB(newBairro);

    if (bairroNameRef.current) bairroNameRef.current.value = '';
    if (coletaTypeRef.current) coletaTypeRef.current.value = '';
    if (inicioColetaRef.current) inicioColetaRef.current.value = '';
    setSelectedDias([]);
  };

  const handleDiasChange = (newValue: MultiValue<{ label: string; value: string }>) => {
    setSelectedDias(newValue as { label: string, value: string }[]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setColetaTypeFilter(value);
    if (value) {
      setFilteredBairros(bairros.filter(bairro => bairro.coleta_type === value));
    } else {
      setFilteredBairros(bairros);
    }
  };

  return (
    <div className='container'>
      <MapContainer className='map-container' center={[-3.71722, -38.54333]} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredBairros.map((bairro, index) => (
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
    <div className='box-content'>
      <form onSubmit={handleBairroSubmit}>
        <input type="text" name="bairroName" placeholder="Nome do Bairro" ref={bairroNameRef} />
        <select name="coletaType" ref={coletaTypeRef}>
          <option value="">Tipo de Coleta</option>
          <option value="diurna">Diurna</option>
          <option value="noturna">Noturna</option>
        </select>
        <select name="inicioColeta" ref={inicioColetaRef}>
          <option value="">Horário de Início da Coleta</option>
          <option value="6:20AM">6:20AM</option>
          <option value="19:00PM">19:00PM</option>
        </select>
        <Select 
          name="diasColeta" 
          value={selectedDias} 
          onChange={handleDiasChange} 
          options={diasDaSemana} 
          isMulti 
          placeholder="Dias de Coleta"
        />
        <button type="submit">Adicionar Bairro</button>
      </form>
      <div className="table-container">
                <h3>Filtrar:</h3>
                <select onChange={handleFilterChange} value={coletaTypeFilter}>
                  <option value="">Todos</option>
                  <option value="diurna">Diurna</option>
                  <option value="noturna">Noturna</option>
                </select>
        <table>
          <thead>
            <tr>
              <th>Bairro</th>
              <th>Tipo de Coleta</th>
             
            </tr>
          </thead>
          <tbody>
            {filteredBairros.map((bairro, index) => (
              <tr key={index}>
                <td>{bairro.bairro_name}</td>
                <td>{bairro.coleta_type}</td>
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