import React, { useState, useEffect, FormEvent } from 'react';
import Select, { MultiValue } from 'react-select';
import { Bairro } from '../../App';
import './FormBairro.css';

interface Option {
  label: string;
  value: string;
}

interface FormBairroProps {
  onSubmit: (bairro: Bairro, onSuccess: () => void) => Promise<void>;
  diasDaSemana: Option[];
  initialData?: Bairro | null;
  isEdit: boolean;
  onSuccess?: () => void;
}

const FormBairro: React.FC<FormBairroProps> = ({ onSubmit, diasDaSemana, initialData, isEdit, onSuccess }) => {
  const [bairroName, setBairroName] = useState(initialData?.bairro_name || '');
  const [coletaType, setColetaType] = useState(initialData?.coleta_type || '');
  const [inicioColeta, setInicioColeta] = useState(initialData?.inicio_coleta || '');
  const [selectedDias, setSelectedDias] = useState<Option[]>(initialData?.dias_coleta.map((dia: string) => ({ label: dia, value: dia })) || []);

  useEffect(() => {
    if (initialData) {
      setBairroName(initialData.bairro_name);
      setColetaType(initialData.coleta_type);
      setInicioColeta(initialData.inicio_coleta);
      setSelectedDias(initialData.dias_coleta.map((dia: string) => ({ label: dia, value: dia })));
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bairro: Bairro = {
      id: initialData?.id || '',
      bairro_name: bairroName,
      coleta_type: coletaType,
      inicio_coleta: inicioColeta,
      dias_coleta: selectedDias.map((dia: Option) => dia.value),
      coordinates: initialData?.coordinates || []
    };
    await onSubmit(bairro, () => {
      if (!isEdit) {
        setBairroName('');
        setColetaType('');
        setInicioColeta('');
        setSelectedDias([]);
        if (onSuccess) onSuccess();
      }
    });
  };

  const handleDiasChange = (newValue: MultiValue<Option>) => {
    setSelectedDias(newValue as Option[]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEdit ? 'Editar Bairro' : 'Adicionar Bairro'}:</h3>
      <input type="text" name="bairroName" placeholder="Nome do Bairro" value={bairroName} onChange={e => setBairroName(e.target.value)} />
      <select name="coletaType" value={coletaType} onChange={e => setColetaType(e.target.value)}>
        <option value="">Tipo de Coleta</option>
        <option value="diurna">Diurna</option>
        <option value="noturna">Noturna</option>
      </select>
      <select name="inicioColeta" value={inicioColeta} onChange={e => setInicioColeta(e.target.value)}>
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
      <button type="submit">{isEdit ? 'Atualizar Bairro' : 'Adicionar Bairro'}</button>
    </form>
  );
};

export default FormBairro;
