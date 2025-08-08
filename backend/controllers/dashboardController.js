const { PrismaClient, TipoAtividade } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const getTomorrowUTC = () => {
  const d = getTodayUTC();
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
};

exports.getMetricasDashboard = async (req, res) => {
  try {
    const hoje = getTodayUTC();
    const amanha = getTomorrowUTC();

    // Contagem total de conviventes
    const totalConviventes = await prisma.convivente.count();

    // Presenças hoje
    const presencasHoje = await prisma.registroAtividade.count({
      where: {
        data: {
          gte: hoje,
          lt: amanha,
        },
        tipo: TipoAtividade.PRESENCA,
      },
    });

    // Refeições hoje (café, almoço, jantar)
    const cafeCount = await prisma.participacaoRefeicao.count({
      where: {
        data: { gte: hoje, lt: amanha },
        tipo: 'CAFE',
        participou: true,
      },
    });
    const almocoCount = await prisma.participacaoRefeicao.count({
      where: {
        data: { gte: hoje, lt: amanha },
        tipo: 'ALMOCO',
        participou: true,
      },
    });
    const jantarCount = await prisma.participacaoRefeicao.count({
      where: {
        data: { gte: hoje, lt: amanha },
        tipo: 'JANTAR',
        participou: true,
      },
    });

    // Ocorrências hoje
    const ocorrenciasHoje = await prisma.ocorrencia.count({
      where: {
        data: {
          gte: hoje,
          lt: amanha,
        },
      },
    });

    // Retorna o objeto esperado pelo frontend
    res.json({
      totalConviventes,
      presencasHoje,
      refeicoesHoje: {
        cafe: cafeCount,
        almoco: almocoCount,
        jantar: jantarCount,
      },
      ocorrenciasHoje,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas do dashboard' });
  }
};
