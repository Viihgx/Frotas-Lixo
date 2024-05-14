import L from 'leaflet';
import markerIcon from '../assets/marker-icon.png'; // Importe sua imagem de ícone personalizado

// Defina o ícone personalizado
const CustomIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [25, 24], // Tamanho do ícone em pixels: largura x altura
    iconAnchor: [12, 41], // Ponto de ancoragem do ícone (onde ele será colocado no mapa)
    popupAnchor: [1, -34], // Ponto de ancoragem do pop-up em relação ao ícone
});

export default CustomIcon;
