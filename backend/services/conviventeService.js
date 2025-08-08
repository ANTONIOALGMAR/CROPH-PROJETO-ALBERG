const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createConvivente = async (data) => {
  console.log('Data received by createConvivente:', data);
  try {
    return await prisma.convivente.create({
      data: {
        nome: data.nome,
        cpf: data.cpf,
        quarto: data.quarto,
        leito: data.leito,
        assistenteSocial: data.assistenteSocial,
        dataNascimento: data.dataNascimento,
        photoUrl: data.photoUrl,
      }
    });
  } catch (error) {
    console.error('Erro no service ao criar convivente:', error);
    throw error; // Re-lança o erro para ser capturado no controller
  }
};

exports.getTodos = async () => {
  try {
    return await prisma.convivente.findMany();
  } catch (error) {
    console.error('Erro no service ao buscar todos os conviventes:', error);
    throw error; // Re-lança o erro
  }
};

exports.getPorId = async (id) => {
  try {
    return await prisma.convivente.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Erro no service ao buscar convivente por ID:', error);
    throw error; // Re-lança o erro
  }
};

/**
 * Atualiza um convivente.
 * A propriedade 'id' é removida do objeto 'data' para evitar erros no Prisma,
 * pois a chave primária não pode ser atualizada.
 */
exports.atualizarConvivente = async (id, data) => {
  try {
    // Cria uma cópia do objeto de dados para não modificar o original
    const updateData = { ...data };
    
    // Remove o campo 'id' do objeto de dados a ser atualizado
    delete updateData.id;

    return await prisma.convivente.update({
      where: { id },
      data: updateData // Usa o objeto de dados sem o 'id'
    });
  } catch (error) {
    console.error('Erro no service ao atualizar convivente:', error);
    throw error; // Re-lança o erro
  }
};

exports.deletarConvivente = async (id) => {
  try {
    return await prisma.convivente.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Erro no service ao deletar convivente:', error);
    throw error; // Re-lança o erro
  }
};
