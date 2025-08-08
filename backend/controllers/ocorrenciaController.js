const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createOcorrencia = async (req, res) => {
  const { titulo, descricao } = req.body;
  const autorId = req.user.id; // Assumindo que o userId é injetado no req pelo middleware de autenticação

  if (!titulo || !descricao) {
    return res.status(400).json({ message: 'Título e descrição são obrigatórios.' });
  }

  try {
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        titulo,
        descricao,
        data: new Date(),
        autor: {
          connect: { id: autorId }
        }
      },
      include: {
        autor: {
          select: {
            id: true,
            email: true,
            role: true,
            nome: true
          }
        }
      }
    });
    res.status(201).json(ocorrencia);
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar ocorrência.' });
  }
};

const getOcorrencias = async (req, res) => {
  try {
    const ocorrencias = await prisma.ocorrencia.findMany({
      where: {
        autor: {
          isNot: null
        }
      },
      orderBy: {
        data: 'desc'
      },
      include: {
        autor: {
          select: {
            id: true,
            email: true,
            role: true,
            nome: true
          }
        }
      }
    });
    res.status(200).json(ocorrencias);
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar ocorrências.' });
  }
};

const updateOcorrencia = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao } = req.body;
  const autorId = req.user.id;

  try {
    const ocorrencia = await prisma.ocorrencia.findUnique({ where: { id } });

    if (!ocorrencia) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    }

    if (ocorrencia.autorId !== autorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta ocorrência.' });
    }

    const updatedOcorrencia = await prisma.ocorrencia.update({
      where: { id },
      data: { titulo, descricao },
      include: {
        autor: {
          select: {
            id: true,
            email: true,
            role: true,
            nome: true
          }
        }
      }
    });

    res.json(updatedOcorrencia);
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar ocorrência.' });
  }
};

const deleteOcorrencia = async (req, res) => {
  const { id } = req.params;
  const autorId = req.user.id;

  try {
    const ocorrencia = await prisma.ocorrencia.findUnique({ where: { id } });

    if (!ocorrencia) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    }

    if (ocorrencia.autorId !== autorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para deletar esta ocorrência.' });
    }

    await prisma.ocorrencia.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar ocorrência:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar ocorrência.' });
  }
};

module.exports = {
  createOcorrencia,
  getOcorrencias,
  updateOcorrencia,
  deleteOcorrencia
};