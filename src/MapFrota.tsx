import React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { obterRotas, adicionarRota } from './db/db';
import './MapFrota.css';
import CustomIcon from './components/CustomIcon';


const MapFrota = () => {
    const [rotas, setRotas] = useState<Array<{bairro: string, horario_coleta: string, dia_coleta: string}>>([]);
    const [bairro, setBairro] = useState<string>('');
    const [horarioColeta, setHorarioColeta] = useState<string>('');
    const [diaColeta, setDiaColeta] = useState<string>('');

    useEffect(() => {
        async function fetchRotas() {
            const rotasDoBanco = await obterRotas();
            setRotas(rotasDoBanco);
        }
        fetchRotas();
    }, []);

    const coordenadasBairros = {
        "Benfica": [-3.731629, -38.537982],
        "Bom Futuro": [-3.757487, -38.579269],
        "Couto Fernandes": [-3.795671, -38.540817],
        "Damas": [-3.746199, -38.557899],
        "Demócrito Rocha": [-3.794967, -38.570228],
        "Dendê": [-3.819089, -38.557539],
        "Fátima": [-3.732517, -38.523741],
        "Itaoca": [-3.767744, -38.614155],
        "Itaperi": [-3.796613, -38.593869],
        "Jardim América": [-3.788533, -38.520517],
        "José Bonifácio": [-3.746927, -38.562729],
        "Montese": [-3.780896, -38.547322],
        "Panamericano": [-3.789855, -38.538558],
        "Parangaba": [-3.784512, -38.527107],
        "Parreão": [-3.759870, -38.522673],
        "Serrinha": [-3.781619, -38.529612],
        "Vila Peri": [-3.814948, -38.560289],
        "Vila União": [-3.728360, -38.546897]
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await adicionarRota(bairro, horarioColeta, diaColeta);
        setBairro('');
        setHorarioColeta('');
        setDiaColeta('');
    };

    return (
        <div className='container-master'>
            <MapContainer center={[-3.7322409, -38.5278619]} zoom={12} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {Object.entries(coordenadasBairros).map(([nomeBairro, coordenadas]) => (
                    <Marker key={nomeBairro} position={[coordenadas[0], coordenadas[1]]} icon={CustomIcon}>
                        <Popup>{nomeBairro}</Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className='container-main-results'>
                <div className="form-container">
                    <h2>Adicione uma rota ao banco de dados:</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Bairro:</label>
                        <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} />

                        <label>Horário de Coleta:</label>
                        <input type="text" value={horarioColeta} onChange={(e) => setHorarioColeta(e.target.value)} />

                        <label>Dia de Coleta:</label>
                        <input type="text" value={diaColeta} onChange={(e) => setDiaColeta(e.target.value)} />

                        <button type="submit">Adicionar Rota</button>
                    </form>
                </div>

                <div className="routes-container">
                    <h2>Rotas existentes:</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Bairro</th>
                                <th>Horário de Coleta</th>
                                <th>Dia de Coleta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rotas.map((rota, index) => (
                                <tr key={index}>
                                    <td>{rota.bairro}</td>
                                    <td>{rota.horario_coleta}</td>
                                    <td>{rota.dia_coleta}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MapFrota;
