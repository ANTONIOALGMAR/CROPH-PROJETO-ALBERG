import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      nome: user.nome ?? user.email, // Evita quebra se não existir
      tipo: user.tipo ?? user.role   // Ajuste se tiver tipo
    }
  };
};
