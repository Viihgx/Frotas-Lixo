import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MenuLateral from './components/menuLateral/MenuLateral';
import MapBairros from './components/mapApi/MapBairros';
import FormBairro from './components/form/FormBairro';
import TableForm from './components/tableForm/TableForm';
import './Moderador.css';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Bairro {
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

const MapFrota: React.FC = () => {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [filteredBairros, setFilteredBairros] = useState<Bairro[]>([]);
  const [coletaTypeFilter, setColetaTypeFilter] = useState<string>('');
  const [selectedBairro, setSelectedBairro] = useState<Bairro | null>(null);
  const [view, setView] = useState<string>('mapa');
  const [alert, setAlert] = useState<string | null>(null);

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

  const saveBairroToDB = async (bairro: Bairro, onSuccess: () => void) => {
    try {
      const response = await axios.post('http://localhost:5000/api/bairros', {
        ...bairro,
        dias_coleta: bairro.dias_coleta.join(', ')
      });
      const savedBairro: ApiBairro = response.data;
      if (!savedBairro) {
        throw new Error('Bairro adicionado não encontrado na resposta da API.');
      }
      const coordinates = await fetchCoordinates(savedBairro.bairro_name);
      if (coordinates) {
        const newBairro: Bairro = {
          ...savedBairro,
          coordinates: [coordinates],
          dias_coleta: savedBairro.dias_coleta.split(',').map(dia => dia.trim())
        };
        setBairros(prevBairros => [...prevBairros, newBairro]);
        setFilteredBairros(prevBairros => [...prevBairros, newBairro]);
        setAlert('Bairro adicionado com sucesso!');
        setTimeout(() => setAlert(null), 3000);
        onSuccess();
      }
      console.log('Saved bairro to DB:', response.data);
    } catch (error) {
      console.error('Error saving bairro to DB:', error);
    }
  };

  const updateBairroToDB = async (bairro: Bairro) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/bairros/${bairro.id}`, {
        ...bairro,
        dias_coleta: bairro.dias_coleta.join(', ')
      });

      const updatedBairro: ApiBairro = response.data;
      if (!updatedBairro) {
        throw new Error('Bairro atualizado não encontrado na resposta da API.');
      }

      const coordinates = await fetchCoordinates(updatedBairro.bairro_name);
      if (coordinates) {
        const updatedBairroWithCoords: Bairro = {
          ...updatedBairro,
          coordinates: [coordinates],
          dias_coleta: updatedBairro.dias_coleta.split(',').map(dia => dia.trim())
        };

        const updatedBairros = bairros.map(b => (b.id === updatedBairroWithCoords.id ? updatedBairroWithCoords : b));
        setBairros(updatedBairros);
        setFilteredBairros(updatedBairros.filter(bairro => bairro.coleta_type === coletaTypeFilter || coletaTypeFilter === ''));
      }

      setAlert('Bairro atualizado com sucesso!');
      setTimeout(() => setAlert(null), 3000);
      setSelectedBairro(null);
    } catch (error) {
      console.error('Error updating bairro to DB:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setColetaTypeFilter(value);
    if (value) {
      const filtered = bairros.filter(bairro => bairro.coleta_type === value);
      setFilteredBairros(filtered);
    } else {
      setFilteredBairros(bairros);
    }
  };

  const handleEdit = (bairro: Bairro) => {
    setSelectedBairro(bairro);
    setView('editar');
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/bairros/${id}`);
      setBairros(prevBairros => prevBairros.filter(bairro => bairro.id !== id));
      setFilteredBairros(prevBairros => prevBairros.filter(bairro => bairro.id !== id));
    } catch (error) {
      console.error('Error deleting bairro:', error);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'mapa':
        return <MapBairros bairros={filteredBairros} />;
      case 'adicionar':
        return (
          <>
            <MapBairros bairros={filteredBairros} />
            <FormBairro 
              onSubmit={saveBairroToDB}
              diasDaSemana={diasDaSemana}
              isEdit={false}
              onSuccess={() => fetchBairrosFromDB()}
            />
          </>
        );
      case 'listar':
        return (
          <>
            <MapBairros bairros={filteredBairros} />
            <div className="content-container">
              <TableForm
                bairros={bairros}
                filteredBairros={filteredBairros}
                coletaTypeFilter={coletaTypeFilter}
                handleFilterChange={handleFilterChange}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          </>
        );
      case 'editar':
        return (
          <>
            <MapBairros bairros={filteredBairros} />
            <div className="content-container">
              <TableForm
                bairros={bairros}
                filteredBairros={filteredBairros}
                coletaTypeFilter={coletaTypeFilter}
                handleFilterChange={handleFilterChange}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
              {selectedBairro && (
                <div className="form-container">
                  <FormBairro 
                    onSubmit={updateBairroToDB}
                    initialData={selectedBairro}
                    diasDaSemana={diasDaSemana}
                    isEdit={true}
                  />
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className='app-container'>
      <MenuLateral onSelect={setView} />
      <div className='content'>
        {alert && <div className="alert">{alert}</div>}
        {renderContent()}
      </div>
    </div>
  );
};

export default MapFrota;
