const { PrismaClient, TipoAtividade } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPresencas = async (req, res) => {
  const { data } = req.query;
  if (!data) {
    return res.status(400).json({ message: 'Data é obrigatória para buscar presenças.' });
  }
  const dataObj = new Date(data);
  try {
    const presencas = await prisma.presenca.findMany({
      where: {
        data: dataObj,
      },
      include: {
        convivente: true,
      },
    });
    res.status(200).json(presencas);
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar presenças.' });
  }
};

exports.registerPresenca = async (req, res) => {
  const { leito, data, presente, conviventeId } = req.body;
  console.log(`[PRESENCA] Recebida requisição para registrar presença: Leito ${leito}, Data ${data}, Presente ${presente}, Convivente ID ${conviventeId}`);
  console.log(`[PRESENCA] Tipo de 'presente' recebido: ${typeof presente}, Valor: ${presente}`);
  if (!leito || !data) {
    return res.status(400).json({ message: 'Leito e data são obrigatórios.' });
  }
  const dataObj = new Date(data);

  // Validação do ObjectId
  if (conviventeId && !/^[0-9a-fA-F]{24}$/.test(conviventeId)) {
    return res.status(400).json({ message: 'ID de convivente inválido.' });
  }

  try {
    const existingPresenca = await prisma.presenca.findUnique({
      where: {
        leito_data: {
          leito: parseInt(leito),
          data: dataObj,
        },
      },
    });

    let presenca;
    if (existingPresenca) {
      presenca = await prisma.presenca.update({
        where: { id: existingPresenca.id },
        data: { presente: presente },
      });
      console.log(`[PRESENCA] Valor de 'presente' após atualização no DB: ${presenca.presente}`);
    } else {
      presenca = await prisma.presenca.create({
        data: {
          leito: parseInt(leito),
          data: dataObj,
          presente: presente,
          convivente: conviventeId ? { connect: { id: conviventeId } } : undefined,
        },
      });
    }

    // Se um convivente estiver associado, atualize o RegistroAtividade
    if (conviventeId) {
      const tipoRegistro = presente ? TipoAtividade.PRESENCA : TipoAtividade.FALTA;

      // Deleta qualquer registro de PRESENCA ou FALTA existente para este convivente e data
      await prisma.registroAtividade.deleteMany({
        where: {
          conviventeId: conviventeId,
          data: dataObj,
          OR: [
            { tipo: TipoAtividade.PRESENCA },
            { tipo: TipoAtividade.FALTA }
          ]
        },
      });

      // Cria o novo registro de atividade
      await prisma.registroAtividade.create({
        data: {
          conviventeId: conviventeId,
          data: dataObj,
          tipo: tipoRegistro,
        },
      });
    }

    res.status(200).json(presenca);
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar presença.' });
  }
};