const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de Login -> /api/auth/login
router.post('/login', authController.login);

// Rota de Registro -> /api/auth/register
router.post('/register', authController.registerUser);

module.exports = router;