const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3002;

// Middleware para parsing de JSON
app.use(express.json());
app.use(express.static('public'));

// Função para ler usuários
const readUsers = () => {
  try {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler users.json:', error);
    return [];
  }
};

// Função para escrever usuários
const writeUsers = (users) => {
  try {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Erro ao escrever em users.json:', error);
  }
};

// Função para ler treinos
const readWorkouts = () => {
  try {
    const data = fs.readFileSync('workouts.json');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler workouts.json:', error);
    return [];
  }
};

// Função para escrever treinos
const writeWorkouts = (workouts) => {
  try {
    fs.writeFileSync('workouts.json', JSON.stringify(workouts, null, 2));
  } catch (error) {
    console.error('Erro ao escrever em workouts.json:', error);
  }
};

// Rota para login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Requisição de login recebida:', { email, password });

  const users = readUsers();
  console.log('Usuários carregados:', users);

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    console.log('Usuário encontrado:', user);
    res.json({ success: true, email: user.email });
  } else {
    console.log('Usuário não encontrado ou credenciais inválidas');
    res.json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Rota para signup
app.post('/signup', (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log('Requisição de signup recebida:', { name, email, phone, password });

  const users = readUsers();

  if (users.find(u => u.email === email)) {
    console.log('E-mail já cadastrado:', email);
    res.json({ success: false, message: 'E-mail já cadastrado' });
    return;
  }

  users.push({ email, password, name, phone });
  writeUsers(users);
  console.log('Usuário cadastrado:', { email, password, name, phone });

  // Inicializar treinos para o novo usuário
  const workouts = readWorkouts();
  workouts.push({ email, workouts: [] });
  writeWorkouts(workouts);
  console.log('Treinos inicializados para o novo usuário:', email);

  res.json({ success: true, message: 'Usuário cadastrado com sucesso' });
});

// Rota para obter treinos de um usuário
app.get('/workouts/:email', (req, res) => {
  const email = req.params.email;
  console.log('Requisição de treinos para:', email);

  const workouts = readWorkouts();
  const userWorkouts = workouts.find(w => w.email === email) || { email, workouts: [] };
  console.log('Treinos encontrados:', userWorkouts);
  res.json(userWorkouts.workouts);
});

// Rota para salvar treinos de um usuário
app.post('/workouts/:email', (req, res) => {
  const email = req.params.email;
  const newWorkouts = req.body;
  console.log('Salvando treinos para:', email, newWorkouts);

  const workouts = readWorkouts();
  const userWorkoutsIndex = workouts.findIndex(w => w.email === email);

  if (userWorkoutsIndex !== -1) {
    workouts[userWorkoutsIndex].workouts = newWorkouts;
  } else {
    workouts.push({ email, workouts: newWorkouts });
  }

  writeWorkouts(workouts);
  console.log('Treinos salvos com sucesso');
  res.json({ success: true });
});

// Rota para a página de admin
app.get('/admin-data', (req, res) => {
  console.log('Requisição de dados para admin');
  const users = readUsers();
  const workouts = readWorkouts();

  const adminData = users.map(user => {
    const userWorkouts = workouts.find(w => w.email === user.email) || { workouts: [] };
    return {
      email: user.email,
      password: user.password,
      workouts: userWorkouts.workouts
    };
  });

  console.log('Dados enviados para admin:', adminData);
  res.json(adminData);
});

// Servir páginas HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});