export interface Presenca {
  id: string;
  leito: number;
  presente: boolean;
  data: string;
  conviventeId: string;
}

export interface Participacao {
  id?: string; // Adicionar id (opcional, pois pode ser temporário)
  leito: number;
  data: string; // Adicionar data
  tipo: 'CAFE' | 'ALMOCO' | 'JANTAR'; // Adicionar tipo
  participou: boolean;
}


export interface Convivente {
  id: string;
  nome: string;
  leito: number;
  cpf?: string;
  rg?: string;
  dataNascimento: string;
  quarto?: string;
  assistenteSocial?: string;
  photoUrl?: string;
}

export interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  autor: {
    nome: string;
  };
}

export interface Leito {
  id: string;
  numero: number;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'INTERDITADO' | 'LIMPEZA';
  motivo?: string;
}

export interface Usuario {
  email: string;
  id: string;
  nome: string;
  tipo: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

export interface DashboardData {
  totalConviventes: number;
  totalLeitosDisponiveis: number;
  totalLeitosOcupados: number;
  totalLeitosManutencao: number;
  totalLeitosInterditados: number;
  totalLeitosLimpeza: number;
  proximosAniversariantes: { nome: string; dataNascimento: string }[];
  ultimasOcorrencias: { titulo: string; data: string }[];
}