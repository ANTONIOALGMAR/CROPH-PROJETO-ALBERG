const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLeitos = async (req, res) => {
  try {
    const leitos = await prisma.leito.findMany({
      orderBy: { numero: 'asc' },
    });
    res.json(leitos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar leitos.' });
  }
};

exports.updateLeitoStatus = async (req, res) => {
  const { id } = req.params;
  const { status, motivo } = req.body;

  try {
    const leito = await prisma.leito.update({
      where: { id },
      data: { status, motivo },
    });
    res.json(leito);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do leito.' });
  }
};
