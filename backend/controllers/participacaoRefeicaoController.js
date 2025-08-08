// backend/controllers/participacaoRefeicaoController.js
const { PrismaClient, TipoAtividade } = require('@prisma/client');
const prisma = new PrismaClient();

// Função para buscar participações de refeição por tipo e data
exports.getParticipacoesRefeicao = async (req, res) => {
  try {
    const { tipo, data } = req.query;

    if (!tipo || !data) {
      return res.status(400).json({ msg: 'Parâmetros tipo e data são obrigatórios.' });
    }

    // Converte a string de data para um objeto Date
    const dataObj = new Date(data + 'T00:00:00.000Z');

    // Define o início e o fim do dia para a consulta
    const startOfDay = new Date(dataObj);
    startOfDay.setUTCHours(0, 0, 0, 0); // Define para o início do dia (UTC)

    const endOfDay = new Date(dataObj);
    endOfDay.setUTCHours(23, 59, 59, 999); // Define para o fim do dia (UTC)

    const participacoes = await prisma.participacaoRefeicao.findMany({
      where: {
        tipo: tipo,
        data: {
          gte: startOfDay, // Greater than or equal to (maior ou igual a)
          lte: endOfDay    // Less than or equal to (menor ou igual a)
        }
      },
      include: {
        convivente: {
          select: {
            id: true,
            nome: true,
            leito: true,
            quarto: true
          }
        }
      }
    });

    res.json(participacoes);
  } catch (error) {
    console.error('Erro ao buscar participações de refeição:', error);
    res.status(500).json({ msg: 'Erro ao buscar participações de refeição.', details: error.message });
  }
};

// backend/controllers/participacaoRefeicaoController.js

exports.registrarAlternarParticipacao = async (req, res) => {
  console.log('[participacaoRefeicaoController] Função registrarAlternarParticipacao iniciada.');
  try {
    const { leito, tipo, data, participou, conviventeId } = req.body;
    const dataObj = new Date(data + 'T00:00:00.000Z');

    const existingParticipacao = await prisma.participacaoRefeicao.findUnique({
      where: {
        leito_tipo_data: {
          leito: parseInt(leito, 10),
          tipo,
          data: dataObj,
        },
      },
    });

    let participacao;
    const participacaoData = {
      leito: parseInt(leito, 10),
      tipo,
      data: dataObj,
      participou,
    };

    if (conviventeId) {
      participacaoData.convivente = { connect: { id: conviventeId } };
    } else if (existingParticipacao?.conviventeId) {
      participacaoData.convivente = { disconnect: true };
    }

    if (existingParticipacao) {
      participacao = await prisma.participacaoRefeicao.update({
        where: {
          leito_tipo_data: {
            leito: parseInt(leito, 10),
            tipo,
            data: dataObj,
          },
        },
        data: participacaoData,
      });
    } else {
      participacao = await prisma.participacaoRefeicao.create({
        data: participacaoData,
      });
    }

    console.log('[participacaoRefeicaoController] Chegou na seção de RegistroAtividade.');
    console.log('[RegistroAtividade Refeição] DEBUG: Valor de participou.');
    // Atualizar ou criar RegistroAtividade
    console.log(`[RegistroAtividade Refeição] Dados recebidos: conviventeId=${conviventeId}, tipo=${tipo}, participou=${participou}`);
    console.log(`[RegistroAtividade Refeição] Tipo de 'participou': ${typeof participou}, Valor: ${participou}`);
    console.log(`[RegistroAtividade Refeição] TipoAtividade[tipo] avaliado para: ${TipoAtividade[tipo as keyof typeof TipoAtividade]}`);
    if (participou) {
      console.log(`[RegistroAtividade Refeição] Tentando deletar registros existentes para conviventeId: ${conviventeId}, data: ${dataObj.toISOString()}, tipo: ${TipoAtividade[tipo as keyof typeof TipoAtividade]}`);
      console.log(`[RegistroAtividade Refeição] Tipo de atividade para deleção: ${TipoAtividade[tipo as keyof typeof TipoAtividade]}`);
      // Deleta qualquer registro existente para este convivente, data e tipo de refeição
      await prisma.registroAtividade.deleteMany({
        where: {
          conviventeId: conviventeId,
          data: dataObj,
          tipo: TipoAtividade[tipo as keyof typeof TipoAtividade],
        },
      });
      console.log(`[RegistroAtividade Refeição] Tentando criar novo registro para conviventeId: ${conviventeId}, data: ${dataObj.toISOString()}, tipo: ${TipoAtividade[tipo as keyof typeof TipoAtividade]}`);
      // Cria o novo registro de atividade
      await prisma.registroAtividade.create({
        data: {
          conviventeId: conviventeId,
          data: dataObj,
          tipo: TipoAtividade[tipo as keyof typeof TipoAtividade],
        },
      });
    } else {
      console.log('[RegistroAtividade Refeição] Entrou no bloco ELSE (participou é false).');
      console.log(`[RegistroAtividade Refeição] Tentando deletar registro (desmarcar) para conviventeId: ${conviventeId}, data: ${dataObj.toISOString()}, tipo: ${TipoAtividade[tipo as keyof typeof TipoAtividade]}`);
      // Se desmarcou a participação, deleta o registro de atividade correspondente
      await prisma.registroAtividade.deleteMany({
        where: {
          conviventeId: conviventeId,
          data: dataObj,
          tipo: TipoAtividade[tipo as keyof typeof TipoAtividade],
        },
      });
    }

    res.status(200).json(participacao);
