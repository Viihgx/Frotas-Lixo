import React from 'react';
import './MenuLateral.css';
import mapa from '../../assets/mapa.png'
import adicionar from '../../assets/adicionar.png'
import listar from '../../assets/listar.png'

interface MenuLateralProps {
  onSelect: (option: string) => void;
}

const MenuLateral: React.FC<MenuLateralProps> = ({ onSelect }) => {
  return (
    <div className="menu-lateral">
      <div className='colum-icons'>
          <button className='button-icon-map' onClick={() => onSelect('mapa')}>
            <img className='img-icon-map' src={mapa} alt="Mapa" />
          </button>
          <div className='div-icon' onClick={() => onSelect('adicionar')}>
            <img className='img-icon' src={adicionar} alt="Adicionar Bairro" />
          </div>
          <div className='div-icon' onClick={() => onSelect('listar')}>
            <img className='img-icon' src={listar} alt="Listar Bairros" />
          </div>
      </div>
    </div>
  );
};

export default MenuLateral;
