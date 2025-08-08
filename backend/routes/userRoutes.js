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

// Rota para criar o primeiro usuário administrador
router.post('/setup-admin', async (req, res) => {
  const { secret, email, password, nome } = req.body;
  const bcrypt = require('bcryptjs');
  const { Role } = require('@prisma/client');

  // Protegemos a rota com um segredo simples
  if (secret !== 'MEU_SEGREDO_DE_SETUP_12345') {
    return res.status(403).json({ message: 'Segredo inválido.' });
  }

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(400).json({ message: 'O usuário administrador já existe.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nome,
        role: Role.ADMIN,
      },
    });

    res.status(201).json({ message: 'Usuário administrador criado com sucesso!', userId: adminUser.id });
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;