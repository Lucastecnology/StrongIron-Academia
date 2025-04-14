const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3800;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Função para ler dados de um arquivo
async function readData(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    if (!data.trim()) {
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    } else if (error instanceof SyntaxError) {
      console.error(`Erro de parsing JSON no arquivo ${file}: ${error.message}`);
      return {};
    }
    throw error;
  }
}

// Função para escrever dados em um arquivo
async function writeData(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Arquivo para armazenar usuários
const usersFile = path.join(__dirname, 'users.json');

// Arquivo para armazenar dietas
const dietsFile = path.join(__dirname, 'diets.json');

// Arquivo para armazenar pesos
const weightsFile = path.join(__dirname, 'weights.json');

// Arquivo para armazenar matrículas
const enrollmentsFile = path.join(__dirname, 'enrollments.json');

// Rota para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`Tentativa de login para o email: ${email}`);
    const users = await readData(usersFile);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      console.log(`Login bem-sucedido para o email: ${email}`);
      res.json({ success: true });
    } else {
      console.log(`Falha no login para o email: ${email} - Email ou senha incorretos`);
      res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
    }
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para signup
app.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    console.log(`Tentativa de cadastro para o email: ${email}`);
    const users = await readData(usersFile);
    if (users.find(u => u.email === email)) {
      console.log(`Email já cadastrado: ${email}`);
      return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }
    users.push({ name, email, phone, password, workouts: [] });
    await writeData(usersFile, users);
    console.log(`Cadastro bem-sucedido para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar signup:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar matrículas
app.post('/enrollments', async (req, res) => {
  const { name, email, cardNumber, cardExpiry, cardCvc } = req.body;
  try {
    console.log(`Salvando matrícula para o email: ${email}`);
    const enrollments = await readData(enrollmentsFile);
    if (enrollments[email]) {
      console.log(`Email já matriculado: ${email}`);
      return res.status(400).json({ success: false, message: 'Email já matriculado.' });
    }
    enrollments[email] = { name, email, cardNumber: cardNumber.slice(-4), cardExpiry, cardCvc, enrolledAt: new Date().toISOString() };
    await writeData(enrollmentsFile, enrollments);
    console.log(`Matrícula salva com sucesso para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar matrícula:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter treinos de um usuário
app.get('/workouts/:email', async (req, res) => {
  const { email } = req.params;
  try {
    console.log(`Obtendo treinos para o email: ${email}`);
    const users = await readData(usersFile);
    const user = users.find(u => u.email === email);
    if (user) {
      console.log(`Treinos encontrados para o email: ${email}`, user.workouts || []);
      res.json(user.workouts || []);
    } else {
      console.log(`Usuário não encontrado para o email: ${email}`);
      res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao obter treinos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar treinos de um usuário
app.post('/workouts/:email', async (req, res) => {
  const { email } = req.params;
  const workouts = req.body;
  try {
    console.log(`Salvando treinos para o email: ${email}`, workouts);
    const users = await readData(usersFile);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].workouts = workouts;
      await writeData(usersFile, users);
      console.log(`Treinos salvos com sucesso para o email: ${email}`);
      res.json({ success: true });
    } else {
      console.log(`Usuário não encontrado para o email: ${email}`);
      res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao salvar treinos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter dietas de um usuário
app.get('/diets/:email', async (req, res) => {
  const { email } = req.params;
  try {
    console.log(`Obtendo dietas para o email: ${email}`);
    const dietsData = await readData(dietsFile);
    const userDiets = dietsData[email] || [];
    console.log(`Dietas encontradas para o email: ${email}`, userDiets);
    res.json(userDiets);
  } catch (error) {
    console.error('Erro ao obter dietas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar dietas de um usuário
app.post('/diets/:email', async (req, res) => {
  const { email } = req.params;
  const diets = req.body;
  try {
    console.log(`Salvando dietas para o email: ${email}`, diets);
    const dietsData = await readData(dietsFile);
    dietsData[email] = diets;
    await writeData(dietsFile, dietsData);
    console.log(`Dietas salvas com sucesso para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar dietas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para obter pesos de um usuário
app.get('/weights/:email', async (req, res) => {
  const { email } = req.params;
  try {
    console.log(`Obtendo pesos para o email: ${email}`);
    const weightsData = await readData(weightsFile);
    const userWeights = weightsData[email] || [];
    console.log(`Pesos encontrados para o email: ${email}`, userWeights);
    res.json(userWeights);
  } catch (error) {
    console.error('Erro ao obter pesos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para salvar pesos de um usuário
app.post('/weights/:email', async (req, res) => {
  const { email } = req.params;
  const weights = req.body;
  try {
    console.log(`Salvando pesos para o email: ${email}`, weights);
    const weightsData = await readData(weightsFile);
    weightsData[email] = weights;
    await writeData(weightsFile, weightsData);
    console.log(`Pesos salvos com sucesso para o email: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`Erro ao salvar pesos: ${error}`);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para dados do admin
app.get('/admin-data', async (req, res) => {
  try {
    console.log('Obtendo dados do admin');
    const users = await readData(usersFile);
    console.log('Dados do admin enviados:', users);
    res.json(users);
  } catch (error) {
    console.error('Erro ao obter dados do admin:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});

// Rota para servir o frontend (deve ser a última rota)
app.get('*', (req, res) => {
  console.log(`Servindo página frontend para a rota: ${req.url}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});