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

export interface ConviventeFormData {
  nome: string;
  email?: string;
  quarto?: string;
  leito: number | '';
  dataNascimento: string;
  assistenteSocial?: string;
  cpf?: string;
  rg?: string;
  preview?: string;
  photo?: File | null;
}

export interface ConviventeApiData {
  nome: string;
  email?: string;
  quarto?: string;
  leito: number;
  dataNascimento: Date;
  assistenteSocial?: string;
  cpf?: string;
  rg?: string;
  photo?: File;
}