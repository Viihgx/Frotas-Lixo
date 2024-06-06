import React, { useState, useEffect } from 'react';
import { adicionarContato, deletarContato, adicionarComentario, obterComentarios } from './notificador-coleta/userserver';
import './CadastroContato.css';

const bairrosDiurnos = [
  "Aldeota", "Bom Jardim", "Cidade 2000", "De Lourdes", "Dom Lustosa", "Genibaú", "Granja Lisboa", 
  "Granja Portugal", "Guararapes", "Henrique Jorge", "Itaperi", "Jardim Fluminense", "Jardim Jatobá", 
  "João Paulo II", "João XXIII", "Jóquei Clube", "Palmeiras", "Papicu", "Parque do Cocó", "Parque dois irmãos", 
  "Parque São José", "Passaré", "Pici", "Praia do Futuro", "Santo Amaro", "Siqueira", "Tatumundé", "Varjota", 
  "Vicente Pinzon"
];

const bairrosDiurnos2 = [
  "Aerolândia", "Alto da Balança", "Álvaro Weyne", "Ancuri", "Barra do Ceará", "Cidade Nova", "Coaçú",
  "Conjunto dos bancários", "Conjunto Palmeiras", "Curió", "Dias Macedo", "Goiabeiras", "Guajeru",
  "Jangurussu", "Jardim Guanabara", "José Walter", "Maria Tomásia", "Mata Galinha", "Mondubim", "Montese",
  "Nova Assunção", "Pantanal", "Parangaba", "Paupina", "Pedras", "Pirambu", "Quintino Cunha", "São João do Tauape",
  "Serrinha", "Sítio Córrego", "Vila Betânia", "Vila Pery", "Vila União"
];

const bairrosNoturnos = [
  "Amadeu Furtado", "Antônio Bezerra", "Autran Nunes", "Barroso", "Bela Vista", "Cidade dos Funcionários",
  "Cajazeiras", "Conjunto Ceará", "Dionísio Torres", "Jardim das Oliveiras", "Joaquim Távora", "Luciano Cavalcante",
  "Meireles", "Padre Andrade", "Parque Araxá", "Parque Iracema", "Parque Manibura", "Parque Rio Branco", 
  "Parquelândia", "Praia de Iracema", "Presidente Kennedy", "Rodolfo Teófilo", "Vila Manuel Sátiro"
];

const bairrosNoturnos2 = [
  "Aracapé", "Bairro de Fátima", "Bairro Ellery", "Benfica", "Bom Futuro", "Cambeba", "Carlito Pamplona", 
  "Centrão", "Centro", "Conjunto Esperança", "Damas", "Demócrito Rocha", "Edson Queiroz", "Farias Brito", 
  "Floresta", "Itaoca", "Jacarecanga", "Jardim América", "Jardim Cearense", "Jardim Iracema", "José Bonifácio", 
  "José de Alencar", "Lagoa Redonda", "Língua de cobra", "Maraponga", "Messejana", "Monte Castelo", 
  "Pan Americano", "Parque Santana", "Parreão", "Presidente Vargas", "Sabiaguaba", "Santa Teresinha", 
  "São Gerardo", "Sapiranga", "Tirol"
];

const CadastroContato = () => {
  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [emailCancelamento, setEmailCancelamento] = useState('');
  const [bairro, setBairro] = useState('');
  const [horarioNotificacao, setHorarioNotificacao] = useState('');
  const [diasNotificacao, setDiasNotificacao] = useState([]);
  const [horasAntes, setHorasAntes] = useState(1); // Padrão para 1 hora antes
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState(''); // 'sucesso' ou 'erro'
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);

  useEffect(() => {
    const carregarComentarios = async () => {
      const { success, data } = await obterComentarios();
      if (success) {
        setComentarios(data);
      } else {
        setMensagem('Erro ao carregar comentários');
        setTipoMensagem('erro');
      }
    };
    carregarComentarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const coletaHora = new Date();
    if (bairrosDiurnos.includes(bairro) || bairrosDiurnos2.includes(bairro)) {
      coletaHora.setHours(6, 20, 0);
    } else if (bairrosNoturnos.includes(bairro) || bairrosNoturnos2.includes(bairro)) {
      coletaHora.setHours(19, 0, 0);
    }

    coletaHora.setHours(coletaHora.getHours() - horasAntes);
    const horarioNotificacaoFormatado = coletaHora.toTimeString().split(' ')[0];

    const result = await adicionarContato(nome, emailCadastro, bairro, horarioNotificacaoFormatado, diasNotificacao);
    if (result.success) {
      setNome('');
      setEmailCadastro('');
      setBairro('');
      setHorarioNotificacao('');
      setDiasNotificacao([]);
      setHorasAntes(1);
      setMensagem('Contato cadastrado com sucesso!');
      setTipoMensagem('sucesso');
    } else {
      setMensagem(`Erro ao cadastrar contato: ${result.error}`);
      setTipoMensagem('erro');
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    const result = await deletarContato(emailCancelamento);
    if (result.success) {
      setEmailCancelamento('');
      setMensagem('Cadastro cancelado com sucesso!');
      setTipoMensagem('sucesso');
    } else {
      setMensagem(`Erro ao cancelar cadastro: ${result.error}`);
      setTipoMensagem('erro');
    }
  };

  const handleBairroChange = (e) => {
    const selectedBairro = e.target.value;
    setBairro(selectedBairro);
    if (bairrosDiurnos.includes(selectedBairro)) {
      setHorarioNotificacao('06:20');
      setDiasNotificacao(['Segunda-feira', 'Quarta-feira', 'Sexta-feira']);
    } else if (bairrosDiurnos2.includes(selectedBairro)) {
      setHorarioNotificacao('06:20');
      setDiasNotificacao(['Terça-feira', 'Quinta-feira', 'Sábado']);
    } else if (bairrosNoturnos.includes(selectedBairro)) {
      setHorarioNotificacao('19:00');
      setDiasNotificacao(['Segunda-feira', 'Quarta-feira', 'Sexta-feira']);
    } else if (bairrosNoturnos2.includes(selectedBairro)) {
      setHorarioNotificacao('19:00');
      setDiasNotificacao(['Terça-feira', 'Quinta-feira', 'Sábado']);
    } else {
      setHorarioNotificacao('');
      setDiasNotificacao([]);
    }
  };

  const handleAvaliacao = (estrela) => {
    setAvaliacao(estrela);
  };

  const handleComentarioChange = (e) => {
    setComentario(e.target.value);
  };

  const handleComentarioSubmit = async (e) => {
    e.preventDefault();
    const result = await adicionarComentario(avaliacao, comentario);
    if (result.success) {
      setComentarios([...comentarios, { avaliacao, comentario, created_at: new Date().toISOString() }]);
      setMensagem('Comentário enviado com sucesso!');
      setTipoMensagem('sucesso');
      setComentario('');
      setAvaliacao(0);
    } else {
      setMensagem(`Erro ao enviar comentário: ${result.error}`);
      setTipoMensagem('erro');
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastre seu contato para receber notificações sobre a coleta de lixo:</h2>
      {mensagem && <div className={`mensagem ${tipoMensagem}`}>{mensagem}</div>}
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={emailCadastro} onChange={(e) => setEmailCadastro(e.target.value)} required />

        <label>Bairro:</label>
        <select value={bairro} onChange={handleBairroChange} required>
          <option value="">Selecione um bairro</option>
          {[...bairrosDiurnos, ...bairrosDiurnos2, ...bairrosNoturnos, ...bairrosNoturnos2].map((bairro) => (
            <option key={bairro} value={bairro}>
              {bairro}
            </option>
          ))}
        </select>

        {bairro && (
          <div>
            <p>A coleta no bairro {bairro} começa às {bairrosNoturnos.includes(bairro) || bairrosNoturnos2.includes(bairro) ? '19:00' : '06:20'} {bairrosDiurnos.includes(bairro) || bairrosNoturnos.includes(bairro) ? 'nas Segundas, Quartas e Sextas' : 'nas Terças, Quintas e Sábados'}.</p>
            <label>Horas antes para notificação:</label>
            <input
              type="number"
              value={horasAntes}
              onChange={(e) => setHorasAntes(Number(e.target.value))}
              min="1"
              required
            />
          </div>
        )}

        <button type="submit">Cadastrar</button>
      </form>

      <h2>Cancele seu cadastro para notificações:</h2>
      <form onSubmit={handleCancelSubmit}>
        <label>Email:</label>
        <input type="email" value={emailCancelamento} onChange={(e) => setEmailCancelamento(e.target.value)} required />
        <button type="submit">Cancelar Cadastro</button>
      </form>

      <h2>Avalie nosso serviço:</h2>
      <div className="avaliacao-estrelas">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <span
            key={estrela}
            className={`estrela ${estrela <= avaliacao ? 'ativa' : ''}`}
            onClick={() => handleAvaliacao(estrela)}
          >
            &#9733;
          </span>
        ))}
      </div>

      <h2>Deixe um comentário:</h2>
      <form onSubmit={handleComentarioSubmit}>
        <textarea
          value={comentario}
          onChange={handleComentarioChange}
          placeholder="Deixe seu comentário aqui"
          required
        />
        <button type="submit">Enviar Comentário</button>
      </form>

      <h2>Comentários:</h2>
      <div className="lista-comentarios">
        {comentarios.map((item, index) => (
          <div key={index} className="comentario">
            <div className="avaliacao-estrelas">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <span
                  key={estrela}
                  className={`estrela ${estrela <= item.avaliacao ? 'ativa' : ''}`}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <p>{item.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CadastroContato;