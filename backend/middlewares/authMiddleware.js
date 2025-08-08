// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
  console.log(`[AUTH] Middleware 'requireAuth' ativado para a rota: ${req.path}`);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH FAIL] Motivo: Token ausente ou mal formatado.');
    return res.status(401).json({ msg: 'Token ausente ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AUTH INFO] Token extraído. Verificando...');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('[AUTH FAIL] Erro na verificação do JWT:', err.name);
      return res.status(401).json({ msg: `Token inválido: ${err.message}` });
    }

    console.log('[AUTH INFO] Token verificado com sucesso. Conteúdo:', decoded);
    const { id, email, role, nome } = decoded;

    if (!id || !email || !role) {
      console.error('[AUTH FAIL] Token decodificado com campos essenciais faltando.');
      return res.status(401).json({ msg: 'Token inválido ou campos de usuário faltando.' });
    }

    req.user = { id, email, role, nome };
    console.log('[AUTH SUCCESS] Usuário autenticado e adicionado à requisição:', req.user);
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    console.log(`[AUTH] Middleware 'requireRole' ativado. Role necessária: ${roles.join(', ')}. Role do usuário: ${req.user?.role}`);
    if (!req.user || !req.user.role) {
      console.log('[AUTH FAIL] Motivo: Informações de usuário ou role faltando na requisição.');
      return res.status(403).json({ msg: 'Informações de usuário faltantes.' });
    }
    if (!roles.includes(req.user.role)) {
      console.log(`[AUTH FAIL] Motivo: Acesso negado. Role do usuário '${req.user.role}' não está na lista de roles permitidas.`);
      return res.status(403).json({
        msg: `Acesso negado. Permissões permitidas: ${roles.join(', ')}`
      });
    }
    console.log('[AUTH SUCCESS] Role do usuário autorizada.');
    next();
  };
};

module.exports = { requireAuth, requireRole };
