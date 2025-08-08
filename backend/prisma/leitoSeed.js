require('dotenv').config({ path: './backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding de leitos...');

  const leitos = [];
  for (let i = 1; i <= 158; i++) {
    leitos.push({
      numero: i,
      status: 'DISPONIVEL',
    });
  }

  for (const leito of leitos) {
    await prisma.leito.upsert({
      where: { numero: leito.numero },
      update: {},
      create: leito,
    });
  }

  console.log('Seeding de leitos concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
