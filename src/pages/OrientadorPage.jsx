// frontend/src/pages/OrientadorPage.jsx
import React, { useState, useEffect } from 'react';
import OrientadorNavbar from '../components/OrientadorNavbar';
import RefeicaoGrid from '../components/RefeicaoGrid';
import PresencaGrid from '../components/PresencaGrid'; // Certifique-se de que este componente existe ou crie-o
import { useAuth } from '../context/AuthContext'; // Apenas para checar se o usuário está logado, se necessário
import { format } from 'date-fns';

const OrientadorPage = () => {
  // Adicione um estado para armazenar o token JWT, inicializando-o do localStorage
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('token')); 
  const [activeGrid, setActiveGrid] = useState('cafe');
  const [conviventes, setConviventes] = useState([]);
  // Estado para a data selecionada, inicializa com a data de hoje formatada
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Use useAuth para obter o objeto de usuário (se precisar de role, etc.).
  // Não precisamos do 'token' daqui, pois já estamos gerenciando-o com jwtToken.
  const { usuario } = useAuth(); 

  // Efeito para carregar o token do localStorage se ainda não estiver no estado
  // (Pode ser redundante com a inicialização direta no useState, mas garante robustez)
  useEffect(() => {
    if (!jwtToken) { // Se o token ainda não estiver no estado (ex: após um refresh e o localStorage ter sido limpo)
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setJwtToken(storedToken); 
      } else {
        console.warn('Token não encontrado no localStorage. O usuário pode não estar autenticado.');
        // Opcional: Redirecionar para a página de login se não houver token
        // navigate('/login'); 
      }
    }
  }, [jwtToken]); // Depende de jwtToken para evitar loops infinitos se ele mudar

  // Função para buscar conviventes
  useEffect(() => {
    const fetchConviventes = async () => {
      if (!jwtToken) {
        console.warn('Token JWT não disponível. Não foi possível buscar conviventes.');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/conviventes', {
          headers: {
            Authorization: `Bearer ${jwtToken}` // Use jwtToken aqui para autenticação
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

    if (jwtToken) { // Só busca conviventes se o token estiver disponível
      fetchConviventes();
    }
  }, [jwtToken]); // Depende do jwtToken para re-executar se ele mudar

  // Função para lidar com o registro de participação (refeição ou presença)
  const handleRegisterParticipation = async (leito, tipoEvento, participou, dataEvento) => {
    if (!jwtToken) {
      alert('Você precisa estar logado para registrar participações.');
      return;
    }

    try {
      let url = '';
      let body = {};

      // Buscar o convivente associado a este leito no momento da ação
      // Isso é feito no frontend para enviar o conviventeId ao backend, se ele existir
      const conviventeNoLeito = conviventes.find(c => parseInt(c.leito, 10) === leito);
      const conviventeId = conviventeNoLeito ? conviventeNoLeito.id : null; // Use c.id se seu modelo usa 'id'

      if (['CAFE', 'ALMOCO', 'JANTAR'].includes(tipoEvento)) {
        url = 'http://localhost:5000/api/participacao-refeicao';
        body = {
          leito: leito,
          tipo: tipoEvento,
          data: dataEvento, // Nome da propriedade 'data'
          participou: participou,
          conviventeId: conviventeId // Envia o ID do convivente, pode ser null
        };
      } else if (tipoEvento === 'PRESENCA') {
        url = 'http://localhost:5000/api/presenca';
        body = {
          leito: leito,
          data: dataEvento, // Nome da propriedade 'data'
          presente: participou,
          conviventeId: conviventeId // Envia o ID do convivente, pode ser null
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
      // O grid que chamou esta função geralmente tem sua própria lógica para recarregar dados
      // após o sucesso desta operação.
    } catch (error) {
      console.error('Erro ao registrar evento:', error.message);
      alert(`Erro ao registrar evento: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Página do Orientador</h1>
      
      {/* Seletor de Data */}
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

      {/* Navbar para seleção do grid de refeição e presença */}
      <OrientadorNavbar onSelectGrid={setActiveGrid} />

      {/* Renderiza o grid ativo APENAS SE O TOKEN ESTIVER DISPONÍVEL */}
      {jwtToken ? ( 
        <>
          {activeGrid === 'cafe' && (
            <RefeicaoGrid 
              tipoRefeicao="CAFE" 
              conviventes={conviventes} // Mantemos conviventes aqui caso o RefeicaoGrid precise dele para display (ex: nome do convivente)
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
          {activeGrid === 'presenca' && ( // Certifique-se de que PresencaGrid exista e seja compatível
            <PresencaGrid 
              conviventes={conviventes} 
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
              token={jwtToken} 
            />
          )}
        </>
      ) : (
        <p>Carregando informações de autenticação...</p> // Ou um spinner, ou redirecionamento para login
      )}

      {/* Lista de Conviventes Cadastrados */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Conviventes Cadastrados (por Assistente)</h3>
        {conviventes.length === 0 && !usuario ? ( 
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