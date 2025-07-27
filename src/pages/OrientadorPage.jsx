// frontend/src/pages/OrientadorPage.jsx
import React, { useState, useEffect } from 'react';
import OrientadorNavbar from '../components/OrientadorNavbar';
import RefeicaoGrid from '../components/RefeicaoGrid';
import PresencaGrid from '../components/PresencaGrid';
import { useAuth } from '../context/AuthContext'; // Apenas para checar se o usuário está logado, se necessário
import { format } from 'date-fns';

const OrientadorPage = () => {
  // Remova 'token' daqui, pois useAuth não o provê diretamente como prop
  // const { token } = useAuth(); // <-- REMOVA ESTA LINHA OU MUDE PARA PEGAR 'usuario' se for usar
  
  // Adicione um estado para armazenar o token JWT
  const [jwtToken, setJwtToken] = useState(null); // Renomeei para 'jwtToken' para evitar confusão

  const [activeGrid, setActiveGrid] = useState('cafe');
  const [conviventes, setConviventes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Use useAuth para obter o objeto de usuário (se precisar de role, etc.)
  const { usuario } = useAuth(); 

  // Efeito para carregar o token do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setJwtToken(storedToken); // Define o token no estado
    } else {
      // Se não há token, talvez redirecionar para o login
      // navigate('/login'); 
      console.warn('Token não encontrado no localStorage. O usuário pode não estar autenticado.');
    }
  }, []); // Executa apenas uma vez ao montar o componente

  // Função para buscar conviventes (esta já estava ok, usando o token do useAuth)
  useEffect(() => {
    const fetchConviventes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/conviventes', {
          headers: {
            Authorization: `Bearer ${jwtToken}` // Use jwtToken aqui
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setConviventes(data);
      } catch (error) {
        console.error('Erro ao buscar conviventes para o Orientador:', error);
      }
    };

    if (jwtToken) { // Agora dependa do estado jwtToken
      fetchConviventes();
    }
  }, [jwtToken]); // Depende do jwtToken

  // Função para lidar com o registro de participação
  const handleRegisterParticipation = async (conviventeId, leito, tipoEvento, participou, dataEvento) => {
    try {
      let url = '';
      let body = {};
      if (['CAFE', 'ALMOCO', 'JANTAR'].includes(tipoEvento)) {
        url = 'http://localhost:5000/api/participacao-refeicao';
        // Adapte o body para corresponder ao que seu backend espera no POST
        body = { conviventeId, leito, tipo: tipoEvento, participou, data: dataEvento }; // Usando 'tipo' e 'data'
      } else if (tipoEvento === 'PRESENCA') {
        url = 'http://localhost:5000/api/presenca';
        body = { conviventeId, dataPresenca: dataEvento, presente: participou };
      } else {
        console.error('Tipo de evento desconhecido:', tipoEvento);
        return;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}` // Use jwtToken aqui também!
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erro ao registrar ${tipoEvento}: ${errorData.error || errorData.msg || res.statusText}`); // Adicionado errorData.msg
      }

      console.log(`Evento ${tipoEvento} para leito ${leito} na data ${dataEvento} registrado/atualizado com sucesso!`);
      // Não se esqueça que o RefeicaoGrid ainda precisa recarregar os dados após o sucesso
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

      <OrientadorNavbar onSelectGrid={setActiveGrid} />

      {/* Renderiza o grid ativo APENAS SE O TOKEN ESTIVER DISPONÍVEL */}
      {jwtToken ? ( 
        <>
          {activeGrid === 'cafe' && (
            <RefeicaoGrid 
              tipoRefeicao="CAFE" 
              conviventes={conviventes} 
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
              token={jwtToken} // <--- PASSE jwtToken AQUI! 
            />
          )}
          {activeGrid === 'almoco' && (
            <RefeicaoGrid 
              tipoRefeicao="ALMOCO" 
              conviventes={conviventes} 
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
              token={jwtToken} // <--- PASSE jwtToken AQUI! 
            />
          )}
          {activeGrid === 'jantar' && (
            <RefeicaoGrid 
              tipoRefeicao="JANTAR" 
              conviventes={conviventes} 
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
              token={jwtToken} // <--- PASSE jwtToken AQUI! 
            />
          )}
          {activeGrid === 'presenca' && (
            <PresencaGrid 
              conviventes={conviventes} 
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
              token={jwtToken} // <--- PASSE jwtToken AQUI! 
            />
          )}
        </>
      ) : (
        <p>Carregando informações de autenticação...</p> // Ou um spinner, ou redirecionamento
      )}

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Conviventes Cadastrados (por Assistente)</h3>
        {conviventes.length === 0 && !usuario ? ( // Mostra "Carregando" se não tiver conviventes e usuário (token) não estiver carregado
          <p>Carregando conviventes...</p>
        ) : conviventes.length === 0 ? (
          <p>Nenhum convivente encontrado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Leito</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>CPF</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Quarto</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Assistente Social</th>
              </tr>
            </thead>
            <tbody>
              {conviventes.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}> {/* Use c.id se seu Prisma usa 'id' */}
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.leito}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.nome}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.cpf}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.quarto}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.assistenteSocial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrientadorPage;