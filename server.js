const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3800;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para inicializar arquivos JSON se não existirem ou estiverem corrompidos
async function initializeFile(filePath, defaultValue) {
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf8');
    JSON.parse(data); // Testa se o arquivo é um JSON válido
  } catch (error) {
    console.log(`Inicializando arquivo ${filePath} com valor padrão:`, defaultValue);
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
  }
}

// Função para ler dados de um arquivo
async function readData(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    if (!data.trim()) {
      if (file === usersFile || file === enrollmentsFile) {
        return [];
      }
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (file === usersFile || file === enrollmentsFile) {
        return [];
      }
      return {};
    } else if (error instanceof SyntaxError) {
      console.error(`Erro de parsing JSON no arquivo ${file}: ${error.message}`);
      if (file === usersFile || file === enrollmentsFile) {
        return [];
      }
      return {};
    }
    throw error;
  }
}

// Função para escrever dados em um arquivo
async function writeData(file, data) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Erro ao escrever no arquivo ${file}:`, error);
    throw error;
  }
}

// Arquivos para armazenar dados
const usersFile = path.join(__dirname, 'users.json');
const dietsFile = path.join(__dirname, 'diets.json');
const weightsFile = path.join(__dirname, 'weights.json');
const enrollmentsFile = path.join(__dirname, 'enrollments.json');

// Inicializar arquivos JSON ao iniciar o servidor
(async () => {
  await initializeFile(usersFile, []);
  await initializeFile(enrollmentsFile, []);
  await initializeFile(dietsFile, {});
  await initializeFile(weightsFile, {});
})();

// Rota para login
app.post('/.netlify/functions/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`[Local Server] Tentativa de login para o email: ${email}`);
    const users = await readData(usersFile);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      console.log(`[Local Server] Login bem-sucedido para o email: ${email}`);
      res.json({ success: true });
    } else {
      console.log(`[Local Server] Falha no login para o email: ${email} - Email ou senha incorretos`);
      res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
    }
  } catch (error) {
    console.error('[Local Server] Erro ao processar login:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para signup
app.post('/.netlify/functions/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    console.log(`[Local Server] Tentativa de cadastro para o email: ${email}`);
    const users = await readData(usersFile);
    if (users.find(u => u.email === email)) {
      console.log(`[Local Server] Email já cadastrado: ${email}`);
      return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }
    users.push({ name, email, phone, password, workouts: [] });
    await writeData(usersFile, users);
    console.log(`[Local Server] Cadastro bem-sucedido para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Local Server] Erro ao processar signup:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar matrículas
app.post('/.netlify/functions/enrollments', async (req, res) => {
  const { name, email, phone, cardNumber, cardExpiry, cardCvc, plan, registrationDate } = req.body;
  try {
    console.log(`[Local Server] Salvando matrícula para o email: ${email}`);
    const enrollments = await readData(enrollmentsFile);
    if (enrollments.find(e => e.email === email)) {
      console.log(`[Local Server] Email já matriculado: ${email}`);
      return res.status(400).json({ success: false, message: 'Email já matriculado.' });
    }
    enrollments.push({ name, email, phone, cardNumber, cardExpiry, cardCvc, plan, registrationDate });
    await writeData(enrollmentsFile, enrollments);
    console.log(`[Local Server] Matrícula salva com sucesso para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Local Server] Erro ao salvar matrícula:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter todas as matrículas
app.get('/.netlify/functions/enrollments', async (req, res) => {
  try {
    console.log('[Local Server] Obtendo todas as matrículas');
    const enrollments = await readData(enrollmentsFile);
    console.log('[Local Server] Matrículas enviadas:', enrollments);
    res.json(enrollments);
  } catch (error) {
    console.error('[Local Server] Erro ao obter matrículas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter treinos de um usuário
app.get('/.netlify/functions/workouts', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
  }
  try {
    console.log(`[Local Server] Obtendo treinos para o email: ${email}`);
    const users = await readData(usersFile);
    const user = users.find(u => u.email === email);
    if (user) {
      console.log(`[Local Server] Treinos encontrados para o email: ${email}`, user.workouts || []);
      res.json(user.workouts || []);
    } else {
      console.log(`[Local Server] Usuário não encontrado para o email: ${email}`);
      res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('[Local Server] Erro ao obter treinos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar treinos de um usuário
app.post('/.netlify/functions/workouts', async (req, res) => {
  const email = req.query.email;
  const workouts = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
  }
  try {
    console.log(`[Local Server] Salvando treinos para o email: ${email}`, workouts);
    const users = await readData(usersFile);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].workouts = workouts;
      await writeData(usersFile, users);
      console.log(`[Local Server] Treinos salvos com sucesso para o email: ${email}`);
      res.json({ success: true });
    } else {
      console.log(`[Local Server] Usuário não encontrado para o email: ${email}`);
      res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('[Local Server] Erro ao salvar treinos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter dietas de um usuário
app.get('/.netlify/functions/diets', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
  }
  try {
    console.log(`[Local Server] Obtendo dietas para o email: ${email}`);
    const dietsData = await readData(dietsFile);
    const userDiets = dietsData[email] || [];
    console.log(`[Local Server] Dietas encontradas para o email: ${email}`, userDiets);
    res.json(userDiets);
  } catch (error) {
    console.error('[Local Server] Erro ao obter dietas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar dietas de um usuário
app.post('/.netlify/functions/diets', async (req, res) => {
  const email = req.query.email;
  const diets = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
  }
  try {
    console.log(`[Local Server] Salvando dietas para o email: ${email}`, diets);
    const dietsData = await readData(dietsFile);
    dietsData[email] = diets;
    await writeData(dietsFile, dietsData);
    console.log(`[Local Server] Dietas salvas com sucesso para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Local Server] Erro ao salvar dietas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter pesos de um usuário
app.get('/.netlify/functions/weights', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
  }
  try {
    console.log(`[Local Server] Obtendo pesos para o email: ${email}`);
    const weightsData = await readData(weightsFile);
    const userWeights = weightsData[email] || [];
    console.log(`[Local Server] Pesos encontrados para o email: ${email}`, userWeights);
    res.json(userWeights);
  } catch (error) {
    console.error('[Local Server] Erro ao obter pesos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar pesos de um usuário
app.post('/.netlify/functions/weights', async (req, res) => {
  const email = req.query.email;
  const weights = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
  }
  try {
    console.log(`[Local Server] Salvando pesos para o email: ${email}`, weights);
    const weightsData = await readData(weightsFile);
    weightsData[email] = weights;
    await writeData(weightsFile, weightsData);
    console.log(`[Local Server] Pesos salvos com sucesso para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('[Local Server] Erro ao salvar pesos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para dados do admin
app.get('/.netlify/functions/admin-data', async (req, res) => {
  try {
    console.log('[Local Server] Obtendo dados do admin');
    const users = await readData(usersFile);
    console.log('[Local Server] Dados do admin enviados:', users);
    res.json(users);
  } catch (error) {
    console.error('[Local Server] Erro ao obter dados do admin:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para servir o frontend (deve ser a última rota)
app.get('*', (req, res) => {
  console.log(`[Local Server] Servindo página frontend para a rota: ${req.url}`);
  const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  fs.access(filePath, fs.constants.F_OK)
    .then(() => res.sendFile(filePath))
    .catch(() => res.sendFile(path.join(__dirname, 'public', '404.html')));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`[Local Server] Servidor rodando em http://localhost:${port}`);
  console.log(`[AVISO] Este servidor é apenas para desenvolvimento local. No Netlify, as rotas são tratadas pelas funções no diretório /functions. Use 'netlify dev' para simular o ambiente do Netlify localmente.`);
});