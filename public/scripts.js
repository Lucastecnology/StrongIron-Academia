// Função para verificar se o usuário está logado e atualizar a navbar
function updateNavbar() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const adminLink = document.getElementById('admin-link');
  const profileLink = document.querySelector('a[href="profile.html"]'); // Seleciona o link "Perfil"
  const signupLink = document.querySelector('a[href="signup.html"]'); // Seleciona o link "Cadastre-se"

  // Verifica se os elementos existem antes de manipulá-los
  if (loginButton && logoutButton) {
    if (loggedInUser) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'inline-block';

      // Mostrar o link "Perfil" se o usuário estiver logado
      if (profileLink) {
        profileLink.style.display = 'inline-block';
      }

      // Esconder o link "Cadastre-se" se o usuário estiver logado
      if (signupLink) {
        signupLink.style.display = 'none';
      }

      // Mostrar o botão "Admin" apenas para admin@admin.com
      if (adminLink) {
        if (loggedInUser === 'admin@admin.com') {
          adminLink.style.display = 'inline-block';
        } else {
          adminLink.style.display = 'none';
        }
      }
    } else {
      loginButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';

      // Esconder o link "Perfil" se o usuário não estiver logado
      if (profileLink) {
        profileLink.style.display = 'none';
      }

      // Mostrar o link "Cadastre-se" se o usuário não estiver logado
      if (signupLink) {
        signupLink.style.display = 'inline-block';
      }

      // Esconder o link "Admin"
      if (adminLink) {
        adminLink.style.display = 'none';
      }
    }
  }
}

// Função para logout
function logout() {
  localStorage.removeItem('loggedInUser');
  updateNavbar();
  window.location.href = 'login.html';
}

// Evento principal ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Atualizar navbar ao carregar a página
  updateNavbar();

  // Evento de logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  // Evento de login (botão na navbar)
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      console.log('Botão Login clicado, redirecionando para login.html');
      window.location.href = 'login.html';
    });
  }

  // Evento de login (formulário)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      console.log('Tentando login com:', JSON.stringify({ email, password }, null, 2));

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        console.log('Resposta do backend:', JSON.stringify(result, null, 2));

        if (result.success) {
          console.log('Login bem-sucedido, salvando no localStorage:', email);
          localStorage.setItem('loggedInUser', email);
          updateNavbar();
          console.log('Redirecionando para dashboard.html');
          window.location.href = 'dashboard.html';
        } else {
          console.error('Erro no login:', result.message);
          alert(result.message);
        }
      } catch (error) {
        console.error('Erro na requisição de login:', error);
        alert('Erro ao tentar fazer login. Verifique o console para mais detalhes.');
        updateNavbar(); // Garante que a navbar seja atualizada mesmo em caso de erro
      }
    });
  }

  // Evento de signup (formulário)
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;

      console.log('Tentando signup com:', JSON.stringify({ name, email, phone, password }, null, 2));

      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        const result = await response.json();
        console.log('Resposta do backend (signup):', JSON.stringify(result, null, 2));

        if (result.success) {
          alert('Cadastro realizado com sucesso! Faça login para continuar.');
          window.location.href = 'login.html';
        } else {
          console.error('Erro no signup:', result.message);
          alert(result.message);
        }
      } catch (error) {
        console.error('Erro na requisição de signup:', error);
        alert('Erro ao tentar cadastrar. Verifique o console para mais detalhes.');
      }
    });
  }

  // Adicionar exercício dinamicamente no formulário
  const addExerciseButton = document.getElementById('add-exercise');
  const exercisesListForAdd = document.getElementById('exercises-list');
  if (addExerciseButton && exercisesListForAdd) {
    addExerciseButton.addEventListener('click', () => {
      const newExerciseEntry = document.createElement('div');
      newExerciseEntry.classList.add('exercise-entry');
      newExerciseEntry.innerHTML = `
        <input type="text" name="exercise" placeholder="Ex: Supino Reto - 4 séries de 10 repetições" required>
        <button type="button" class="remove-exercise">Remover</button>
      `;
      exercisesListForAdd.appendChild(newExerciseEntry);

      // Adicionar evento de remoção para o novo botão "Remover"
      newExerciseEntry.querySelector('.remove-exercise').addEventListener('click', () => {
        if (exercisesListForAdd.children.length > 1) {
          exercisesListForAdd.removeChild(newExerciseEntry);
        } else {
          alert('Você deve ter pelo menos um exercício.');
        }
      });
    });
  }

  // Evento para remover exercício no formulário
  const exercisesList = document.getElementById('exercises-list');
  if (exercisesList) {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-exercise')) {
        const exerciseEntry = e.target.parentElement;
        if (exercisesList.children.length > 1) {
          exercisesList.removeChild(exerciseEntry);
        } else {
          alert('Você deve ter pelo menos um exercício.');
        }
      }
    });
  }

  // Adicionar novo treino
  const addWorkoutForm = document.getElementById('add-workout-form');
  if (addWorkoutForm) {
    addWorkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = localStorage.getItem('loggedInUser');
      if (!email) {
        window.location.href = 'login.html';
        return;
      }

      const day = document.getElementById('new-day').value;
      const title = document.getElementById('new-title').value;
      const exercises = Array.from(document.querySelectorAll('#exercises-list input[name="exercise"]'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');

      if (exercises.length === 0) {
        alert('Adicione pelo menos um exercício.');
        return;
      }

      try {
        const response = await fetch(`/workouts/${email}`);
        const workouts = await response.json();

        // Verificar se o dia já existe
        const existingDayIndex = workouts.findIndex(w => w.day === day);
        if (existingDayIndex !== -1) {
          alert('Já existe um treino para este dia. Edite ou exclua o treino existente.');
          return;
        }

        workouts.push({ day, title, exercises });
        await fetch(`/workouts/${email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workouts),
        });
        location.reload();
      } catch (error) {
        console.error('Erro ao adicionar treino:', error);
        alert('Erro ao adicionar treino. Verifique o console para mais detalhes.');
      }
    });
  }

  // Carregar treinos na página de dashboard
  const workoutsBody = document.getElementById('workouts-body');
  if (workoutsBody) {
    const email = localStorage.getItem('loggedInUser');
    if (!email) {
      window.location.href = 'login.html';
      return;
    }

    fetch(`/workouts/${email}`)
      .then(response => response.json())
      .then(workouts => {
        console.log('Treinos carregados:', JSON.stringify(workouts, null, 2));
        workouts.forEach((workout, index) => {
          const row = document.createElement('tr');
          const exercisesList = workout.exercises.map((exercise, exIndex) => `
            <div class="exercise-item">
              ${exercise}
              <button onclick="removeExercise(${index}, ${exIndex})">Remover</button>
            </div>
          `).join('');
          row.innerHTML = `
            <td>${workout.day}</td>
            <td>${workout.title}</td>
            <td>
              ${exercisesList}
              <button onclick="addExerciseToDay(${index})">Adicionar Exercício</button>
            </td>
            <td>
              <button onclick="editWorkout(${index})">Editar</button>
              <button onclick="deleteWorkout(${index})">Excluir</button>
            </td>
          `;
          workoutsBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Erro ao carregar treinos:', error);
      });
  }

  // Carregar dados na página de admin
  const usersTableBody = document.getElementById('users-table-body');
  if (usersTableBody) {
    const email = localStorage.getItem('loggedInUser');
    if (!email || email !== 'admin@admin.com') {
      window.location.href = 'login.html';
      return;
    }

    fetch('/admin-data')
      .then(response => response.json())
      .then(users => {
        console.log('Dados dos usuários carregados:', JSON.stringify(users, null, 2));
        users.forEach(user => {
          const row = document.createElement('tr');
          const workoutsList = user.workouts.map(w => `
            ${w.day} (${w.title}):<br>
            ${w.exercises.map(ex => `- ${ex}`).join('<br>')}
          `).join('<br><br>');
          row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>${workoutsList || 'Nenhum treino'}</td>
          `;
          usersTableBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Erro ao carregar dados dos usuários:', error);
      });
  }

  // Calcular IMC
  const imcForm = document.getElementById('imc-form');
  if (imcForm) {
    imcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const weight = parseFloat(document.getElementById('weight').value);
      const height = parseFloat(document.getElementById('height').value);
      const imc = (weight / (height * height)).toFixed(2);
      document.getElementById('imc-result').innerText = `Seu IMC é: ${imc}`;
    });
  }

  // Formulário de contato
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      contactForm.reset();
    });
  }
});

// Função para editar treino
function editWorkout(index) {
  const email = localStorage.getItem('loggedInUser');
  fetch(`/workouts/${email}`)
    .then(response => response.json())
    .then(workouts => {
      const workout = workouts[index];
      const row = document.getElementById('workouts-body').children[index];
      row.innerHTML = `
        <td>
          <select id="edit-day-${index}">
            <option value="Segunda" ${workout.day === 'Segunda' ? 'selected' : ''}>Segunda</option>
            <option value="Terça" ${workout.day === 'Terça' ? 'selected' : ''}>Terça</option>
            <option value="Quarta" ${workout.day === 'Quarta' ? 'selected' : ''}>Quarta</option>
            <option value="Quinta" ${workout.day === 'Quinta' ? 'selected' : ''}>Quinta</option>
            <option value="Sexta" ${workout.day === 'Sexta' ? 'selected' : ''}>Sexta</option>
            <option value="Sábado" ${workout.day === 'Sábado' ? 'selected' : ''}>Sábado</option>
            <option value="Domingo" ${workout.day === 'Domingo' ? 'selected' : ''}>Domingo</option>
          </select>
        </td>
        <td><input type="text" id="edit-title-${index}" value="${workout.title}"></td>
        <td>
          <div id="edit-exercises-${index}">
            ${workout.exercises.map((exercise, exIndex) => `
              <div class="exercise-item">
                <input type="text" value="${exercise}" id="edit-exercise-${index}-${exIndex}">
                <button onclick="removeExerciseDuringEdit(${index}, ${exIndex})">Remover</button>
              </div>
            `).join('')}
          </div>
          <button onclick="addExerciseDuringEdit(${index})">Adicionar Exercício</button>
        </td>
        <td>
          <button onclick="saveWorkout(${index})">Salvar</button>
          <button onclick="cancelEdit(${index})">Cancelar</button>
        </td>
      `;
    })
    .catch(error => {
      console.error('Erro ao editar treino:', error);
    });
}

// Função para adicionar exercício durante a edição
function addExerciseDuringEdit(index) {
  const exercisesDiv = document.getElementById(`edit-exercises-${index}`);
  const exIndex = exercisesDiv.children.length;
  const newExercise = document.createElement('div');
  newExercise.classList.add('exercise-item');
  newExercise.innerHTML = `
    <input type="text" placeholder="Novo exercício" id="edit-exercise-${index}-${exIndex}">
    <button onclick="removeExerciseDuringEdit(${index}, ${exIndex})">Remover</button>
  `;
  exercisesDiv.appendChild(newExercise);
}

// Função para remover exercício durante a edição
function removeExerciseDuringEdit(index, exIndex) {
  const exercisesDiv = document.getElementById(`edit-exercises-${index}`);
  if (exercisesDiv.children.length > 1) {
    exercisesDiv.removeChild(exercisesDiv.children[exIndex]);
  } else {
    alert('Você deve ter pelo menos um exercício.');
  }
}

// Função para salvar treino editado
function saveWorkout(index) {
  const email = localStorage.getItem('loggedInUser');
  const day = document.getElementById(`edit-day-${index}`).value;
  const title = document.getElementById(`edit-title-${index}`).value;
  const exercises = Array.from(document.querySelectorAll(`#edit-exercises-${index} input`))
    .map(input => input.value)
    .filter(value => value.trim() !== '');

  if (exercises.length === 0) {
    alert('Adicione pelo menos um exercício.');
    return;
  }

  fetch(`/workouts/${email}`)
    .then(response => response.json())
    .then(workouts => {
      // Verificar se o dia já existe (exceto no índice atual)
      const existingDayIndex = workouts.findIndex((w, i) => w.day === day && i !== index);
      if (existingDayIndex !== -1) {
        alert('Já existe um treino para este dia. Escolha outro dia ou exclua o treino existente.');
        return;
      }

      workouts[index] = { day, title, exercises };
      fetch(`/workouts/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workouts),
      }).then(() => location.reload());
    })
    .catch(error => {
      console.error('Erro ao salvar treino:', error);
    });
}

// Função para cancelar edição
function cancelEdit(index) {
  location.reload();
}

// Função para excluir treino
function deleteWorkout(index) {
  const email = localStorage.getItem('loggedInUser');
  fetch(`/workouts/${email}`)
    .then(response => response.json())
    .then(workouts => {
      workouts.splice(index, 1);
      fetch(`/workouts/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workouts),
      }).then(() => location.reload());
    })
    .catch(error => {
      console.error('Erro ao excluir treino:', error);
    });
}

// Função para adicionar exercício a um dia existente
function addExerciseToDay(index) {
  const email = localStorage.getItem('loggedInUser');
  fetch(`/workouts/${email}`)
    .then(response => response.json())
    .then(workouts => {
      const newExercise = prompt('Digite o novo exercício (ex.: Supino Reto - 4 séries de 10 repetições):');
      if (newExercise && newExercise.trim() !== '') {
        workouts[index].exercises.push(newExercise);
        fetch(`/workouts/${email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workouts),
        }).then(() => location.reload());
      }
    })
    .catch(error => {
      console.error('Erro ao adicionar exercício:', error);
    });
}

// Função para remover exercício de um dia
function removeExercise(dayIndex, exIndex) {
  const email = localStorage.getItem('loggedInUser');
  fetch(`/workouts/${email}`)
    .then(response => response.json())
    .then(workouts => {
      if (workouts[dayIndex].exercises.length > 1) {
        workouts[dayIndex].exercises.splice(exIndex, 1);
        fetch(`/workouts/${email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workouts),
        }).then(() => location.reload());
      } else {
        alert('Você deve ter pelo menos um exercício. Para remover o dia inteiro, use o botão "Excluir".');
      }
    })
    .catch(error => {
      console.error('Erro ao remover exercício:', error);
    });
}