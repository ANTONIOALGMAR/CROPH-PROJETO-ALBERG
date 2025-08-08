import React, { useState, useEffect, useCallback } from 'react';
import { useProtectedFetch } from '../hooks/useProtectedFetch';
import { Convivente } from '../types/Convivente';
import { Leito, LeitoStatus } from '../types/Leito';

interface LeitoMapaGridProps {
  conviventes: Convivente[];
}

const statusColors: Record<LeitoStatus, { bg: string; text: string; border: string }> = {
  [LeitoStatus.DISPONIVEL]: { bg: '#f0f0f0', text: '#888', border: '#ccc' },
  [LeitoStatus.OCUPADO]: { bg: '#e6ffe6', text: '#006600', border: '#a3e9a4' },
  [LeitoStatus.MANUTENCAO]: { bg: '#fffbe6', text: '#b45309', border: '#fde047' },
  [LeitoStatus.INTERDITADO]: { bg: '#feecf0', text: '#dc2626', border: '#fca5a5' },
  [LeitoStatus.LIMPEZA]: { bg: '#e0f2fe', text: '#0284c7', border: '#7dd3fc' },
};

const LeitoMapaGrid: React.FC<LeitoMapaGridProps> = ({ conviventes }) => {
  const { fetchData } = useProtectedFetch<Leito[]>();
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [leitosMap, setLeitosMap] = useState<Map<number, Leito>>(new Map());
  const [conviventesMap, setConviventesMap] = useState<Map<number, Convivente>>(new Map());
  const [selectedLeito, setSelectedLeito] = useState<Leito | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<LeitoStatus>(LeitoStatus.DISPONIVEL);
  const [updateMotivo, setUpdateMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  const fetchLeitos = useCallback(async () => {
    try {
      const data = await fetchData(`${BASE_BACKEND_URL}/api/leitos`);
      if (data) setLeitos(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [BASE_BACKEND_URL, fetchData]);

  useEffect(() => {
    fetchLeitos();
  }, [fetchLeitos]);

  useEffect(() => {
    const newLeitosMap = new Map<number, Leito>();
    (leitos || []).forEach(leito => newLeitosMap.set(leito.numero, leito));
    setLeitosMap(newLeitosMap);

    const newConviventesMap = new Map<number, Convivente>();
    (conviventes || []).forEach(c => {
      const leitoNum = typeof c.leito === 'string' ? parseInt(c.leito, 10) : c.leito;
      if (!isNaN(leitoNum)) newConviventesMap.set(leitoNum, c);
    });
    setConviventesMap(newConviventesMap);
  }, [leitos, conviventes]);

  const handleLeitoClick = (leitoNumero: number) => {
    const leito = leitosMap.get(leitoNumero);
    if (leito && !conviventesMap.has(leitoNumero)) {
      setSelectedLeito(leito);
      setUpdateStatus(leito.status);
      setUpdateMotivo(leito.motivo || '');
      setIsModalOpen(true);
      setError(null);
    }
  };

  // Atualiza status e motivo (PUT)
  const handleUpdateStatus = async () => {
    if (!selectedLeito) return;
    try {
      await fetchData(`${BASE_BACKEND_URL}/api/leitos/${selectedLeito.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: updateStatus, motivo: updateMotivo }),
      });
      await fetchLeitos();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Exclui leito (DELETE) — id é string
  const handleDeleteLeito = async (leitoId: string) => {
    try {
      await fetchData(`${BASE_BACKEND_URL}/api/leitos/${leitoId}`, {
        method: 'DELETE',
      });
      await fetchLeitos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Função para criar novo leito — removida ou comentada para evitar warning ESLint
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateLeito = async (novoLeito: Omit<Leito, 'id'>) => {
    try {
      await fetchData(`${BASE_BACKEND_URL}/api/leitos`, {
        method: 'POST',
        body: JSON.stringify(novoLeito),
      });
      await fetchLeitos();
    } catch (err: any) {
      setError(err.message);
    }
  };
  */

  const leitosArray = Array.from({ length: 158 }, (_, i) => i + 1);

  return (
    <>
      <div
        style={{
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ marginBottom: '15px', color: '#555', textAlign: 'center' }}>Mapa de Leitos</h3>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '10px',
          }}
        >
          {leitosArray.map((leitoNum) => {
            const convivente = conviventesMap.get(leitoNum);
            const leito = leitosMap.get(leitoNum);
            const status = convivente ? LeitoStatus.OCUPADO : leito?.status || LeitoStatus.DISPONIVEL;
            const colors = statusColors[status];

            return (
              <div
                key={leitoNum}
                onClick={() => handleLeitoClick(leitoNum)}
                style={{
                  border: `1px solid ${colors.border}`,
                  padding: '10px 5px',
                  textAlign: 'center',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '90px',
                  fontSize: '0.9em',
                  cursor: convivente ? 'default' : 'pointer',
                  transition: 'transform 0.2s',
                }}
              >
                <span style={{ fontSize: '1.3em', marginBottom: '5px' }}>{leitoNum}</span>
                {convivente ? (
                  <>
                    <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{convivente.nome.split(' ')[0]}</span>
                    {convivente.photoUrl ? (
                      <img
                        src={`${BASE_BACKEND_URL}/${convivente.photoUrl}`}
                        alt={convivente.nome}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }}
                      />
                    ) : (
                      <img
                        src="/placeholder.jpg"
                        alt="Usuário Padrão"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }}
                      />
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: '0.7em', textTransform: 'capitalize' }}>
                    {leito?.status.toLowerCase().replace('_', ' ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para atualizar status do leito */}
      {isModalOpen && selectedLeito && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '20px' }}>
              Atualizar Status do Leito {selectedLeito.numero}
            </h4>
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="status-select" style={{ display: 'block', marginBottom: '5px' }}>
                Status
              </label>
              <select
                id="status-select"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value as LeitoStatus)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {Object.values(LeitoStatus)
                  .filter((s) => s !== LeitoStatus.OCUPADO)
                  .map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="motivo-input" style={{ display: 'block', marginBottom: '5px' }}>
                Motivo (Opcional)
              </label>
              <input
                id="motivo-input"
                type="text"
                value={updateMotivo}
                onChange={(e) => setUpdateMotivo(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white' }}
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  if (selectedLeito) {
                    handleDeleteLeito(selectedLeito.id);
                    setIsModalOpen(false);
                  }
                }}
                style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#dc2626', color: 'white' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeitoMapaGrid;
