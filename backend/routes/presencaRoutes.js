const express = require('express');
const router = express.Router();
const presencaController = require('../controllers/presencaController'); // Importar o controller
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Rota para buscar presenças
router.get('/', requireAuth, requireRole(['ADMIN', 'ASSISTENTE', 'ORIENTADOR']), presencaController.getPresencas);

// Rota para registrar presença
router.post('/', requireAuth, requireRole(['ADMIN', 'ASSISTENTE']), presencaController.registerPresenca);

module.exports = router;