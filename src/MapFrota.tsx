import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { obterRotas, adicionarRota } from './db/db';

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
        <div>
            <form onSubmit={handleSubmit}>
                <label>Bairro:</label>
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} />

                <label>Horário de Coleta:</label>
                <input type="text" value={horarioColeta} onChange={(e) => setHorarioColeta(e.target.value)} />

                <label>Dia de Coleta:</label>
                <input type="text" value={diaColeta} onChange={(e) => setDiaColeta(e.target.value)} />

                <button type="submit">Adicionar Rota</button>
            </form>

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

            <div>
                <h2>Rotas existentes:</h2>
                <ul>
                    {rotas.map((rota, index) => (
                        <li key={index}>{rota.bairro} - {rota.horario_coleta} - {rota.dia_coleta}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MapFrota;
