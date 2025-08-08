const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seeding...');

  const adminEmail = 'admin@example.com';

  // 1. Deleta o admin antigo, se existir, para evitar duplicatas
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log('Usuário admin existente encontrado. Deletando...');
    await prisma.user.delete({ where: { email: adminEmail } });
  }

  // 2. Cria o novo usuário admin
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  console.log('Criando o novo usuário administrador...');
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      nome: 'Administrador Padrão',
      passwordHash: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('Usuário administrador criado com sucesso:');
  console.log(adminUser);

  // Adicionando conviventes de exemplo
  console.log('Criando conviventes de exemplo...');
  const convivente1 = await prisma.convivente.create({
    data: {
      nome: 'João Silva',
      leito: 1,
      cpf: '111.111.111-11',
      dataNascimento: new Date('1990-01-15T00:00:00.000Z'),
      quarto: 'A1',
      assistenteSocial: 'Maria Souza',
    },
  });

  const convivente2 = await prisma.convivente.create({
    data: {
      nome: 'Maria Oliveira',
      leito: 2,
      cpf: '222.222.222-22',
      dataNascimento: new Date('1985-05-20T00:00:00.000Z'),
      quarto: 'A1',
      assistenteSocial: 'Maria Souza',
    },
  });

  const convivente3 = await prisma.convivente.create({
    data: {
      nome: 'Pedro Santos',
      leito: 3,
      cpf: '333.333.333-33',
      dataNascimento: new Date('1992-11-10T00:00:00.000Z'),
      quarto: 'B2',
      assistenteSocial: 'João Pereira',
    },
  });

  console.log('Conviventes de exemplo criados com sucesso:');
  console.log(convivente1);
  console.log(convivente2);
  console.log(convivente3);
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding finalizado. Desconectando do Prisma...');
    await prisma.$disconnect();
  });