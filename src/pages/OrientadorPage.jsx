// frontend/src/pages/OrientadorPage.jsx
import React, { useState, useEffect } from 'react';
import OrientadorNavbar from '../components/OrientadorNavbar';
import RefeicaoGrid from '../components/RefeicaoGrid';
import PresencaGrid from '../components/PresencaGrid'; 
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const OrientadorPage = () => {
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('token')); 
  const [activeGrid, setActiveGrid] = useState('cafe'); 
  const [activeTab, setActiveTab] = useState('grids'); // 'grids' ou 'listaConviventes'
  const [conviventes, setConviventes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { usuario } = useAuth(); 

  useEffect(() => {
    if (!jwtToken) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setJwtToken(storedToken); 
      } else {
        console.warn('Token não encontrado no localStorage. O usuário pode não estar autenticado.');
        // Opcional: Redirecionar para a página de login se não houver token
        // navigate('/login'); 
      }
    }
  }, [jwtToken]); 

  useEffect(() => {
    const fetchConviventes = async () => {
      if (!jwtToken) {
        console.warn('Token JWT não disponível. Não foi possível buscar conviventes.');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/conviventes', {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setConviventes(data);
      } catch (error) {
        console.error('Erro ao buscar conviventes para o Orientador:', error);
        alert('Erro ao carregar a lista de conviventes.');
      }
    };

    if (jwtToken) { 
      fetchConviventes();
    }
  }, [jwtToken]); 

  const handleRegisterParticipation = async (leito, tipoEvento, participou, dataEvento) => {
    if (!jwtToken) {
      alert('Você precisa estar logado para registrar participações.');
      return;
    }

    try {
      let url = '';
      let body = {};

      const conviventeNoLeito = conviventes.find(c => parseInt(c.leito, 10) === leito);
      const conviventeId = conviventeNoLeito ? conviventeNoLeito.id : null;

      if (['CAFE', 'ALMOCO', 'JANTAR'].includes(tipoEvento)) {
        url = 'http://localhost:5000/api/participacao-refeicao';
        body = {
          leito: leito,
          tipo: tipoEvento,
          data: dataEvento,
          participou: participou,
          conviventeId: conviventeId 
        };
      } else if (tipoEvento === 'PRESENCA') {
        url = 'http://localhost:5000/api/presenca';
        body = {
          leito: leito,
          data: dataEvento,
          presente: participou,
          conviventeId: conviventeId 
        };
      } else {
        console.error('Tipo de evento desconhecido:', tipoEvento);
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
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Registro de participação/presença bem-sucedido:', result);
    } catch (error) {
      console.error('Erro ao registrar evento:', error.message);
      alert(`Erro ao registrar evento: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Página do Orientador</h1>
      
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

      <div style={{ marginBottom: '20px', display: 'flex', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('grids')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'grids' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'grids' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            fontWeight: 'bold',
            outline: 'none',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          Grids de Participação/Presença
        </button>
        <button
          onClick={() => setActiveTab('listaConviventes')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'listaConviventes' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'listaConviventes' ? 'white' : '#333',
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
      </div>

      {jwtToken ? ( 
        <>
          {activeTab === 'grids' && (
            <div>
              <OrientadorNavbar onSelectGrid={setActiveGrid} /> 
              {activeGrid === 'cafe' && (
                <RefeicaoGrid 
                  tipoRefeicao="CAFE" 
                  conviventes={conviventes} 
                  dataSelecionada={selectedDate}
                  onRegisterParticipation={handleRegisterParticipation}
                  token={jwtToken} 
                />
              )}
              {activeGrid === 'almoco' && (
                <RefeicaoGrid 
                  tipoRefeicao="ALMOCO" 
                  conviventes={conviventes}
                  dataSelecionada={selectedDate}
                  onRegisterParticipation={handleRegisterParticipation}
                  token={jwtToken} 
                />
              )}
              {activeGrid === 'jantar' && (
                <RefeicaoGrid 
                  tipoRefeicao="JANTAR" 
                  conviventes={conviventes}
                  dataSelecionada={selectedDate}
                  onRegisterParticipation={handleRegisterParticipation}
                  token={jwtToken} 
                />
              )}
              {activeGrid === 'presenca' && (
                <PresencaGrid 
                  conviventes={conviventes} 
                  dataSelecionada={selectedDate}
                  onRegisterParticipation={handleRegisterParticipation}
                  token={jwtToken} 
                />
              )}
            </div>
          )}

          {activeTab === 'listaConviventes' && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Conviventes Cadastrados</h3>
              {conviventes.length === 0 && !usuario ? ( 
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
                                src={c.photoUrl} 
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
        </>
      ) : (
        <p>Carregando informações de autenticação...</p> 
      )}
    </div>
  );
};

export default OrientadorPage;