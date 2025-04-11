## StrongIron - Sistema de Gerenciamento de Treinos

Um sistema web para gerenciamento de treinos e acompanhamento de progresso físico, com funcionalidades de cadastro, login, cálculo de IMC, administração de usuários, gerenciamento de dietas e pesos.

## Demonstração
[Em breve]

## Funcionalidades
- Cadastro e login de usuários
- Controle de acesso (usuário comum e admin)
- Gerenciamento de treinos (CRUD)
- Gerenciamento de dietas (CRUD)
- Acompanhamento de peso com gráfico interativo
- Cálculo de IMC
- Interface responsiva e interativa

## Técnicas e Tecnologias
- Frontend: HTML, CSS, JavaScript, Chart.js (para gráficos de peso)
- Backend: Node.js com Express
- Armazenamento: Arquivos JSON (users.json, diets.json, weights.json)
- Outros: Fetch API, manipulação de DOM, design responsivo, CORS

## Pré-requisitos
- Node.js (versão 14 ou superior recomendada)
- npm (geralmente instalado com o Node.js)
- Um navegador web moderno (como Chrome, Firefox, etc.)

## Como Executar

1. Clone o repositório:
   git clone <URL>
   cd StrongIron-Academia

2. Instale as dependências:
   npm install
   npm install express
   npm install cors

3. Inicie o servidor:
   - Para rodar o servidor normalmente:
     npm start
   - Para rodar com nodemon (reinicia automaticamente ao fazer alterações no código):
     npm run dev

4. Acesse o sistema:
   - Abra o navegador e acesse: http://localhost:3800
   - Para testar, use as credenciais de admin: admin@admin.com (sem senha específica, conforme o fluxo de login).

## Scripts Disponíveis
- npm start: Inicia o servidor com node server.js.
- npm run dev: Inicia o servidor com nodemon server.js para desenvolvimento (reinicia automaticamente ao alterar arquivos).
- npm run kill-port: Libera a porta 3800 (útil se a porta estiver em uso). Comando específico para Windows.
- npm run restart: Executa kill-port e depois start para reiniciar o servidor.

## Estrutura do Projeto
- server.js: Arquivo principal do backend com as rotas e lógica do servidor.
- public/: Diretório com os arquivos frontend (HTML, CSS, JavaScript).
  - index.html: Página inicial.
  - student-area.html: Área do aluno com gerenciamento de dietas, pesos e cálculo de IMC.
  - scripts.js: Lógica JavaScript do frontend.
  - styles.css: Estilização do projeto.
- users.json: Arquivo para armazenar os dados dos usuários.
- diets.json: Arquivo para armazenar as dietas dos usuários.
- weights.json: Arquivo para armazenar os registros de peso dos usuários.

## Notas
- Certifique-se de que a porta 3800 está livre antes de iniciar o servidor. Use npm run kill-port se houver problemas.
- O sistema usa arquivos JSON para armazenamento. Certifique-se de que os arquivos users.json, diets.json e weights.json existam na raiz do projeto com conteúdo inicial {}.
- O projeto foi configurado para rodar na porta 3800, conforme definido no server.js.

## Licença
[Em breve]