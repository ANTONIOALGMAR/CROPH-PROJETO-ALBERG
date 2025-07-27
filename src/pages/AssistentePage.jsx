// frontend/src/pages/AssistentePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PresencaGrid from '../components/PresencaGrid';
import LeitoMapaGrid from '../components/LeitoMapaGrid';
import { format } from 'date-fns';

const AssistentePage = () => {
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('token'));
  const [conviventes, setConviventes] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('leitosMapa'); 

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [newConvivente, setNewConvivente] = useState({
    nome: '',
    leito: '',
    cpf: '',
    dataNascimento: '',
    quarto: '',
    assistenteSocial: '', 
  });
  const [selectedFile, setSelectedFile] = useState(null); 

  const [cadastroMessage, setCadastroMessage] = useState(null);

  const navigate = useNavigate();
  const { usuario } = useAuth(); 

  // URL base do backend para carregar imagens
  const BASE_BACKEND_URL = 'http://localhost:3001';

  useEffect(() => {
    if (!jwtToken) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setJwtToken(storedToken);
      } else {
        console.warn('Token não encontrado no localStorage. Redirecionando para o login.');
        navigate('/login'); 
      }
    }
  }, [jwtToken, navigate]);

  const fetchConviventes = useCallback(async () => {
    if (!jwtToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_BACKEND_URL}/api/conviventes`, { 
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setConviventes(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar conviventes:', err);
      setError('Erro ao carregar conviventes.');
      setConviventes([]); 
    } finally {
      setLoading(false);
    }
  }, [jwtToken]); 

  const fetchOcorrencias = useCallback(async () => {
    if (!jwtToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_BACKEND_URL}/api/ocorrencias`, { 
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setOcorrencias(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar ocorrências:', err);
      setError('Erro ao carregar ocorrências.');
      setOcorrencias([]); 
    } finally {
      setLoading(false);
    }
  }, [jwtToken]); 

  useEffect(() => {
    if (jwtToken) {
      if (activeTab === 'conviventes' || activeTab === 'ocorrencias' || activeTab === 'leitosMapa') {
        setLoading(true); 
      } else {
        setLoading(false); 
      }

      if (activeTab === 'conviventes' || activeTab === 'leitosMapa' || activeTab === 'presenca') { 
        fetchConviventes();
      } else if (activeTab === 'ocorrencias') {
        fetchOcorrencias();
      }
    }
  }, [jwtToken, activeTab, fetchConviventes, fetchOcorrencias]);

  useEffect(() => {
    if (usuario && usuario.email && newConvivente.assistenteSocial === '') {
      setNewConvivente(prev => ({ ...prev, assistenteSocial: usuario.email }));
    }
  }, [usuario, newConvivente.assistenteSocial]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConvivente(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); 
  };

  const handleCadastroConvivente = async (e) => {
    e.preventDefault();
    setCadastroMessage(null);

    if (!newConvivente.nome || !newConvivente.leito || !newConvivente.cpf || !newConvivente.dataNascimento || !newConvivente.quarto || !newConvivente.assistenteSocial) {
      setCadastroMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }
    if (isNaN(parseInt(newConvivente.leito, 10))) {
      setCadastroMessage({ type: 'error', text: 'Leito deve ser um número válido.' });
      return;
    }
    if (newConvivente.cpf.length !== 11 || !/^\d+$/.test(newConvivente.cpf)) {
      setCadastroMessage({ type: 'error', text: 'CPF deve conter 11 dígitos numéricos.' });
      return;
    }
    const dataNasc = new Date(newConvivente.dataNascimento);
    if (isNaN(dataNasc.getTime())) {
      setCadastroMessage({ type: 'error', text: 'Data de Nascimento inválida.' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nome', newConvivente.nome);
      formData.append('leito', parseInt(newConvivente.leito, 10).toString()); 
      formData.append('cpf', newConvivente.cpf);
      formData.append('dataNascimento', dataNasc.toISOString());
      formData.append('quarto', newConvivente.quarto);
      formData.append('assistenteSocial', newConvivente.assistenteSocial);
      
      if (selectedFile) { 
        formData.append('photo', selectedFile); 
      }

      const res = await fetch(`${BASE_BACKEND_URL}/api/conviventes`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: formData 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Erro ao cadastrar convivente.');
      }

      setCadastroMessage({ type: 'success', text: 'Convivente cadastrado com sucesso!' });
      setNewConvivente({ 
        nome: '',
        leito: '',
        cpf: '',
        dataNascimento: '',
        quarto: '',
        assistenteSocial: usuario.email || '', 
      });
      setSelectedFile(null); 
      fetchConviventes(); 
      setActiveTab('leitosMapa'); 
    } catch (err) {
      console.error('Erro no cadastro de convivente:', err);
      setCadastroMessage({ type: 'error', text: `Erro: ${err.message}` });
    }
  };

  const handleRegisterParticipation = useCallback(async (leito, tipoEvento, participou, dataEvento) => {
    if (!jwtToken) {
      console.warn('Você precisa estar logado para registrar participações.');
      return;
    }

    try {
      const conviventeNoLeito = conviventes.find(c => parseInt(c.leito, 10) === leito);
      
      const conviventeId = conviventeNoLeito ? conviventeNoLeito.id : null;

      let url = '';
      let body = {};

      if (tipoEvento === 'PRESENCA') {
        url = `${BASE_BACKEND_URL}/api/presenca`; 
        body = {
          leito: leito,
          data: dataEvento,
          presente: participou,
          conviventeId: conviventeId 
        };
      } else {
        console.error('Tipo de evento desconhecido ou não suportado pela AssistentePage:', tipoEvento);
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro no registro de participação/presença:', errorData.msg || `HTTP error! status: ${response.status}`);
        return; 
      }

      const result = await response.json();
      console.log('Registro de participação/presença bem-sucedido:', result);
    } catch (error) {
      console.error('Erro ao registrar evento:', error.message);
    }
  }, [jwtToken, conviventes]);


  if (loading && !usuario) { 
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando página da Assistente...</p>;
  }

  if (!usuario || usuario.role !== 'ASSISTENTE') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        <p>Acesso negado. Você não tem permissão para acessar esta página.</p>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
          Voltar ao Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Página da Assistente Social</h1>
      
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {activeTab === 'presenca' && ( 
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label htmlFor="eventDate" style={{ marginRight: '10px', fontWeight: 'bold' }}>Data do Evento:</label>
          <input
            type="date"
            id="eventDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      )}

      {/* Navegação por Abas */}
      <div style={{ marginBottom: '20px', display: 'flex', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('presenca')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'presenca' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'presenca' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            fontWeight: 'bold',
            outline: 'none',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          Presença
        </button>
        <button
          onClick={() => setActiveTab('leitosMapa')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'leitosMapa' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'leitosMapa' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            fontWeight: 'bold',
            outline: 'none',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          Mapa de Leitos
        </button>
        <button
          onClick={() => setActiveTab('conviventes')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'conviventes' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'conviventes' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            fontWeight: 'bold',
            outline: 'none',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
        Lista de Conviventes
        </button>
        <button
          onClick={() => setActiveTab('ocorrencias')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'ocorrencias' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'ocorrencias' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            fontWeight: 'bold',
            outline: 'none',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          Ocorrências
        </button>
        <button
          onClick={() => setActiveTab('cadastrarConvivente')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'cadastrarConvivente' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'cadastrarConvivente' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            fontWeight: 'bold',
            outline: 'none',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          Cadastrar Convivente
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {jwtToken && ( 
        <>
          {activeTab === 'presenca' && (
            <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Registro de Presença Diária</h3>
                <PresencaGrid
                    conviventes={conviventes}
                    dataSelecionada={selectedDate}
                    onRegisterParticipation={handleRegisterParticipation}
                    token={jwtToken}
                />
            </div>
          )}

          {activeTab === 'leitosMapa' && (
            <div style={{ marginTop: '20px' }}>
              {loading ? (
                <p>Carregando mapa de leitos...</p>
              ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
              ) : (
                <LeitoMapaGrid conviventes={conviventes} token={jwtToken} />
              )}
            </div>
          )}

          {activeTab === 'conviventes' && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Conviventes Cadastrados</h3>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {loading ? ( 
                <p>Carregando conviventes...</p>
              ) : conviventes.length === 0 ? (
                <p>Nenhum convivente encontrado.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Leito</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>CPF</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Quarto</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Assistente Social</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conviventes.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.leito}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.nome}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.cpf}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.quarto}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.assistenteSocial}</td>
                          <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center' }}>
                            {c.photoUrl ? (
                              <img 
                                src={`${BASE_BACKEND_URL}/${c.photoUrl}`} 
                                alt={`Foto de ${c.nome}`} 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
                              />
                            ) : (
                              <span style={{ fontSize: '0.8em', color: '#999' }}>Sem foto</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ocorrencias' && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Ocorrências Registradas</h3>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {loading ? (
                <p>Carregando ocorrências...</p>
              ) : ocorrencias.length === 0 ? (
                <p>Nenhuma ocorrência encontrada.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Título</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Descrição</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Data</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Autor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ocorrencias.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{o.titulo}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{o.descricao}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(o.data).toLocaleDateString()}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{o.autor?.email || 'Desconhecido'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cadastrarConvivente' && (
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Cadastrar Novo Convivente</h3>
              
              {cadastroMessage && (
                <p style={{ 
                  color: cadastroMessage.type === 'success' ? 'green' : 'red', 
                  backgroundColor: cadastroMessage.type === 'success' ? '#d4edda' : '#f8d7da', 
                  padding: '10px', 
                  borderRadius: '5px', 
                  marginBottom: '15px' 
                }}>
                  {cadastroMessage.text}
                </p>
              )}

              <form onSubmit={handleCadastroConvivente} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label htmlFor="nome" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome:</label>
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    value={newConvivente.nome} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="leito" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Leito:</label>
                  <input 
                    type="number" 
                    id="leito" 
                    name="leito" 
                    value={newConvivente.leito} 
                    onChange={handleInputChange} 
                    required 
                    min="1" max="158"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="cpf" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CPF:</label>
                  <input 
                    type="text" 
                    id="cpf" 
                    name="cpf" 
                    value={newConvivente.cpf} 
                    onChange={handleInputChange} 
                    required 
                    maxLength="11" 
                    placeholder="Somente números (11 dígitos)"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="dataNascimento" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data de Nascimento:</label>
                  <input 
                    type="date" 
                    id="dataNascimento" 
                    name="dataNascimento" 
                    value={newConvivente.dataNascimento} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="quarto" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quarto:</label>
                  <input 
                    type="text" 
                    id="quarto" 
                    name="quarto" 
                    value={newConvivente.quarto} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="assistenteSocial" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assistente Social:</label>
                  <input 
                    type="text" 
                    id="assistenteSocial" 
                    name="assistenteSocial" 
                    value={newConvivente.assistenteSocial} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label htmlFor="photo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Foto (opcional):</label>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  {selectedFile && <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#555' }}>Arquivo selecionado: {selectedFile.name}</p>}
                </div>
                <div style={{ gridColumn: '1 / span 2', textAlign: 'center', marginTop: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' }}>
                    Cadastrar Convivente
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssistentePage;
