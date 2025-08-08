export enum LeitoStatus {
  DISPONIVEL = 'DISPONIVEL',
  MANUTENCAO = 'MANUTENCAO',
  INTERDITADO = 'INTERDITADO',
  LIMPEZA = 'LIMPEZA',
  OCUPADO = 'OCUPADO',
}

export interface Leito {
  id: string;
  numero: number;
  status: LeitoStatus;
  motivo?: string;
  convivente?: {
    id: string;
    nome: string;
    photoUrl?: string;
  };
}
