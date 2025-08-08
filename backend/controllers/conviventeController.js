const service = require('../services/conviventeService.js'); // Importa o serviço de conviventes

// Função para criar um novo convivente
const criar = async (req, res) => {
  const data = { ...req.body }; // Cria uma cópia para não modificar req.body diretamente
  if (req.file) {
    data.photoUrl = req.file.path; // Adiciona o caminho da imagem ao objeto de dados
  }

  // Converte 'leito' para número inteiro, se existir
  if (data.leito !== undefined && data.leito !== null && data.leito !== '') {
    data.leito = parseInt(data.leito, 10);
    if (isNaN(data.leito)) {
      return res.status(400).json({ erro: 'Valor inválido para leito. Esperado um número inteiro.' });
    }
  }

  try {
    const novo = await service.createConvivente(data); // Chama a função do serviço para criar
    res.status(201).json(novo); // Retorna status 201 (Created) e o novo convivente
  } catch (err) {
    console.error('[ERRO NO CONTROLLER - CRIAR CONVIVENTE]', err); // Loga o erro
    res.status(500).json({ erro: 'Erro ao criar convivente', detalhes: err.message }); // Retorna erro 500
  }
};

// Função para listar todos os conviventes
const getTodos = async (req, res) => {
  console.log('[GET /conviventes] Tentando buscar a lista de conviventes...');
  try {
    const conviventes = await service.getTodos(); // Chama a função do serviço para buscar todos
    console.log(`[GET /conviventes] Sucesso! Encontrados ${conviventes.length} conviventes.`);
    res.status(200).json(conviventes); // Retorna status 200 (OK) e a lista de conviventes
  } catch (err) {
    console.error('[GET /conviventes] ERRO AO BUSCAR CONVIVENTES:', err); // Loga o erro
    res.status(500).json({ erro: 'Erro ao buscar conviventes', detalhes: err.message }); // Retorna erro 500
  }
};

// Função para deletar um convivente por ID
const deletarConvivente = async (req, res) => {
  const { id } = req.params; // Pega o ID do parâmetro da URL
  console.log(`[DELETE /conviventes/:id] Tentando deletar convivente com ID: ${id}`);
  try {
    await service.deletarConvivente(id); // Chama a função do serviço para deletar
    console.log(`[DELETE /conviventes/:id] Convivente ${id} deletado com sucesso.`);
    res.status(204).send(); // Retorna status 204 (No Content) para DELETE bem-sucedido
  } catch (err) {
    console.error(`[DELETE /conviventes/:id] ERRO AO DELETAR CONVIVENTE ${id}:`, err); // Loga o erro
    res.status(500).json({ erro: 'Erro ao deletar convivente', detalhes: err.message }); // Retorna erro 500
  }
};

// --- FUNÇÃO ATUALIZAR CONVIVENTE ---
const atualizarConvivente = async (req, res) => {
  const { id } = req.params; // Pega o ID do parâmetro da URL
  const data = req.body; // Pega os dados de atualização do corpo da requisição
  if (req.file) {
    data.photoUrl = req.file.path; // Adiciona o caminho da imagem ao objeto de dados
  }

  // Converte 'leito' para número inteiro, se existir
  if (data.leito !== undefined && data.leito !== null && data.leito !== '') {
    data.leito = parseInt(data.leito, 10);
    if (isNaN(data.leito)) {
      return res.status(400).json({ erro: 'Valor inválido para leito. Esperado um número inteiro.' });
    }
  }

  console.log(`[PUT /conviventes/:id] Tentando atualizar convivente com ID: ${id}. Dados:`, data);
  try {
    const conviventeAtualizado = await service.atualizarConvivente(id, data); // Chama a função do serviço para atualizar
    console.log(`[PUT /conviventes/:id] Convivente ${id} atualizado com sucesso:`, conviventeAtualizado);
    res.status(200).json(conviventeAtualizado); // Retorna status 200 (OK) e o convivente atualizado
  } catch (err) {
    console.error(`[PUT /conviventes/:id] ERRO AO ATUALIZAR CONVIVENTE ${id}:`, err); // Loga o erro
    res.status(500).json({ erro: 'Erro ao atualizar convivente', detalhes: err.message }); // Retorna erro 500
  }
};
// --- FIM DA FUNÇÃO ATUALIZAR CONVIVENTE ---

// Exporta todas as funções do controller
module.exports = {
  criar,
  getTodos,
  deletarConvivente,
  atualizarConvivente, // Garante que 'atualizarConvivente' está sendo exportada
};
