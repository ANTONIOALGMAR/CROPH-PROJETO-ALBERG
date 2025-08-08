const express = require('express');
const conviventeController = require('../controllers/conviventeController.js');
const upload = require('../config/multerConfig');

const router = express.Router();

// ADICIONE ESTE LOG PARA DEPURAR
console.log('Valor de conviventeController.atualizarConvivente na rota:', typeof conviventeController.atualizarConvivente);

// Rota para listar todos os conviventes -> GET /api/conviventes/
router.get('/', conviventeController.getTodos);

// Rota para criar um novo convivente -> POST /api/conviventes/
router.post('/', upload.single('photo'), conviventeController.criar);

// Rota para deletar um convivente por ID -> DELETE /api/conviventes/:id
router.delete('/:id', conviventeController.deletarConvivente);

// Rota para atualizar um convivente por ID -> PUT /api/conviventes/:id
router.put('/:id', upload.single('photo'), conviventeController.atualizarConvivente); // Linha 17

module.exports = router;
