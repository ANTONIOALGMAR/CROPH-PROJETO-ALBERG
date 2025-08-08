const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient, Role } = require('@prisma/client'); // Importe Role
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const logToFile = (message) => {
  const logPath = path.join(__dirname, '..', 'login_attempts.log');
  fs.appendFileSync(logPath, new Date().toISOString() + ' - ' + message + '\n');
};

// Função para gerar o token JWT padronizado .
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido.');
  }
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    nome: user.nome,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

exports.registerUser = async (req, res) => {
  console.log('[REGISTER ATTEMPT] Recebido no req.body:', req.body);
  const { email, password, role, nome } = req.body;

  // Validação de campos obrigatórios
  if (!email || !password || !nome || !role) {
    console.log('[REGISTER FAIL] Motivo: Campos obrigatórios faltando.');
    return res.status(400).json({
      message: 'Campos obrigatórios faltando.',
      details: 'Os campos email, password, nome e role são todos necessários.',
      received: req.body
    });
  }

  try {
    // Verificação de usuário existente
    console.log(`[REGISTER INFO] Verificando se o usuário com email ${email} já existe...`);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('[REGISTER FAIL] Motivo: Usuário já existe.');
      return res.status(400).json({
        message: 'Usuário já existe.',
        details: `O email '${email}' já está cadastrado.`
      });
    }

    // Validação da Role
    console.log('[REGISTER INFO] Usuário não existe, continuando...');
    const validRoles = Object.keys(Role);
    console.log(`[REGISTER INFO] Validando role '${role}' contra as roles válidas:`, validRoles);
    if (!validRoles.includes(role)) {
      console.log('[REGISTER FAIL] Motivo: Role inválida.');
      return res.status(400).json({
        message: 'Função (role) inválida.',
        details: `A função '${role}' não é válida. As opções são: ${validRoles.join(', ')}.`
      });
    }
    
    // Se tudo estiver certo, continua...
    console.log('[REGISTER INFO] Role é válida. Criando usuário no banco de dados...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        nome,
      },
    });

    console.log('[REGISTER SUCCESS] Usuário criado com sucesso:', newUser);
    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      token: generateToken(newUser),
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        nome: newUser.nome,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário.', details: error.message });
  }
};

exports.login = async (req, res) => {
  logToFile('\n[LOGIN ATTEMPT]');
  logToFile('Recebido no req.body: ' + JSON.stringify(req.body));

  const { password } = req.body;
  const email = req.body.email ? req.body.email.trim() : undefined;

  if (!email || !password) {
    logToFile('Resultado: Falha - Email ou senha não fornecidos no corpo da requisição.');
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      logToFile(`Resultado: Falha - Usuário com email '${email}' não encontrado no banco de dados.`);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    logToFile(`Usuário '${email}' encontrado. Comparando senhas...`);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash); // Usar user.passwordHash

    if (!isPasswordValid) {
      logToFile('Resultado: Falha - A comparação de senha (bcrypt.compare) retornou falso.');
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    logToFile('Resultado: Sucesso - Senha válida.');
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nome: user.nome,
      },
    });

  } catch (error) {
    console.error('[ERRO NO LOGIN]', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role, nome } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, role, nome },
      select: { id: true, email: true, role: true, nome: true },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar usuário.', details: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Primeiro, verifique se o usuário existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Se o usuário existir, delete-o
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar usuário ${id}:`, error);
    res.status(500).json({ message: 'Erro ao deletar usuário.', details: error.message });
  }
};


