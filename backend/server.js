require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 
           'http://localhost:3002',
           'https://croph-projeto-alberg.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Middlewares
const { requireAuth, requireRole } = require('./middlewares/authMiddleware');

// Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conviventeRoutes = require('./routes/conviventeRoutes');
const dashboardController = require('./controllers/dashboardController');
const participacaoRefeicaoRoutes = require('./routes/participacaoRefeicaoRoutes');
const ocorrenciasRouter = require('./routes/ocorrencias');
const leitoRoutes = require('./routes/leitoRoutes');
const presencaRoutes = require('./routes/presencaRoutes');

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/users', requireAuth, requireRole(['ADMIN']), userRoutes);
app.use('/api/conviventes', requireAuth, requireRole(['ASSISTENTE', 'ADMIN', 'ORIENTADOR']), conviventeRoutes);

// Dashboard
app.get('/api/dashboard/metricas', requireAuth, requireRole(['ASSISTENTE', 'ADMIN', 'ORIENTADOR']), dashboardController.getMetricasDashboard);

// Outras rotas protegidas
app.use('/api/ocorrencias', requireAuth, requireRole(['ASSISTENTE', 'ADMIN', 'ORIENTADOR']), ocorrenciasRouter);
app.use('/api/leitos', requireAuth, leitoRoutes);
app.use('/api/participacao-refeicao', requireAuth, participacaoRefeicaoRoutes);
app.use('/api/presenca', requireAuth, requireRole(['ASSISTENTE', 'ADMIN', 'ORIENTADOR']), presencaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Dashboard métricas em: http://localhost:${PORT}/api/dashboard/metricas`);
});
