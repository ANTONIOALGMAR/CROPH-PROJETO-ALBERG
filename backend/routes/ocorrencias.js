const express = require('express');
const { createOcorrencia, getOcorrencias, updateOcorrencia, deleteOcorrencia } = require('../controllers/ocorrenciaController.js');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.route('/').post(requireAuth, createOcorrencia).get(requireAuth, getOcorrencias);
router.route('/:id').put(requireAuth, updateOcorrencia).delete(requireAuth, requireRole(['admin']), deleteOcorrencia);

module.exports = router;
