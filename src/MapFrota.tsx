import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { obterRotas, adicionarRota } from './db/db';
import './MapFrota.css';

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await adicionarRota(bairro, horarioColeta, diaColeta);
        setBairro('');
        setHorarioColeta('');
        setDiaColeta('');
    };

    return (
        <div className='container-master'>
            <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[51.505, -0.09]}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
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
