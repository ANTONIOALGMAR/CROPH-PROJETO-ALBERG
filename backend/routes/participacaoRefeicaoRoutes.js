const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Buscar participações por data e tipo de refeição
router.get('/', async (req, res) => {
  const { data, tipo } = req.query;

  if (!data || !tipo) {
    return res.status(400).json({ error: 'Data e tipo de refeição são obrigatórios.' });
  }

  const dataObj = new Date(data);

  try {
    const participacoes = await prisma.participacaoRefeicao.findMany({
      where: {
        data: dataObj,
        tipo,
      },
      include: {
        convivente: true,
      },
    });

    res.json(participacoes);
  } catch (error) {
    console.error('Erro ao buscar participações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Registrar ou alternar participação
router.post('/', async (req, res) => {
  console.log('req.body recebido:', req.body);
  console.log('Content-Type recebido:', req.headers['content-type']);
  const { leito, data, tipo } = req.body;

  if (!leito || !data || !tipo) {
    return res.status(400).json({ error: 'Leito, data e tipo são obrigatórios.' });
  }

  const dataObj = new Date(data);

  try {
    const convivente = await prisma.convivente.findUnique({
      where: { leito: parseInt(leito) },
    });

    if (!convivente) {
      return res.status(404).json({ error: 'Convivente não encontrado para o leito informado.' });
    }

    const existing = await prisma.participacaoRefeicao.findUnique({
      where: {
        leito_data_tipo: {
          leito: parseInt(leito),
          data: dataObj,
          tipo,
        },
      },
    });

    if (existing) {
      // Se existe, atualiza com o valor enviado
      const updated = await prisma.participacaoRefeicao.update({
        where: { id: existing.id },
        data: { participou: req.body.participou }, // Usa o valor do corpo da requisição
      });

      return res.json(updated);
    } else {
      // Cria novo registro
      const created = await prisma.participacaoRefeicao.create({
        data: {
          leito: parseInt(leito),
          data: dataObj,
          tipo,
          participou: req.body.participou, // Usa o valor do corpo da requisição
          convivente: {
            connect: { id: convivente.id },
          },
        },
      });

      return res.json(created);
    }
  } catch (error) {
    console.error('Erro ao registrar participação:', error);
    res.status(500).json({ error: 'Erro interno ao registrar participação.' });
  }
});

module.exports = router;
