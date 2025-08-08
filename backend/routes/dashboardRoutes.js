const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rotas principais
router.get('/stats', dashboardController.getStats);
router.get('/presencas', dashboardController.getPresencasChartData);
router.get('/refeicoes', dashboardController.getRefeicoesChartData);
router.get('/ocorrencias', dashboardController.getOcorrenciasChartData);
router.get('/presencas-semanais', dashboardController.getPresencasSemanaisData);
router.get('/refeicoes-mensais', dashboardController.getRefeicoesMensaisData);
router.get('/refeicoes-hoje', dashboardController.getRefeicoesHoje);
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/metricas', dashboardController.getMetricasDashboard);

module.exports = router;