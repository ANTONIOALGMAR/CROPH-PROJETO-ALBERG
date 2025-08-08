const express = require('express');
const router = express.Router();
const leitoController = require('../controllers/leitoController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, leitoController.getAllLeitos);
router.put('/leitos/:id', requireAuth, leitoController.updateLeitoStatus);

module.exports = router;
