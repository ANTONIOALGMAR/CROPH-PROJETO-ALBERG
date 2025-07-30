// src/types/Convivente.tsx
export interface Convivente {
  id: string;
  nome: string;
  leito: number;
  cpf: string;
  dataNascimento: string;
  quarto: string;
  assistenteSocial: string;
  photoUrl?: string;
}
