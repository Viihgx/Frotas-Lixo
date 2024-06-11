import React from 'react';
import './TableForm.css';

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

interface TableFormProps {
  bairros: Bairro[];
  filteredBairros: Bairro[];
  coletaTypeFilter: string;
  handleFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleEdit: (bairro: Bairro) => void;
  handleDelete: (id: string) => void;
}

const TableForm: React.FC<TableFormProps> = ({ filteredBairros, coletaTypeFilter, handleFilterChange, handleEdit, handleDelete }) => {
  return (
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
            <th>Dias de Coleta</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredBairros.map((bairro, index) => (
            <tr key={index}>
              <td>{bairro.bairro_name}</td>
              <td>{bairro.coleta_type}</td>
              <td>{bairro.dias_coleta.join(', ')}</td>
              <td>
                <button className='button-table' onClick={() => handleEdit(bairro)}>Editar</button>
                <button className='button-table' onClick={() => handleDelete(bairro.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableForm;
