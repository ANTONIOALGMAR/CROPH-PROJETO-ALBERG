const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authController = require('../controllers/authController');

// Rota para listar todos os usuários -> GET /api/users/
router.get('/', async (req, res) => {
  console.log('[GET /users] Tentando buscar a lista de usuários...');
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
      },
      orderBy: { nome: 'asc' },
    });
    console.log(`[GET /users] Sucesso! Encontrados ${users.length} usuários.`);
    res.json(users);
  } catch (error) {
    console.error('[GET /users] ERRO AO BUSCAR USUÁRIOS:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários.', details: error.message });
  }
});

// Rota para atualizar um usuário -> PUT /api/users/:id
router.put('/:id', authController.updateUser);

// Rota para deletar um usuário -> DELETE /api/users/:id
router.delete('/:id', authController.deleteUser);

module.exports = router;