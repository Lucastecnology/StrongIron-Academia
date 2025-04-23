// Função para verificar se o usuário está logado e atualizar a navbar
function updateNavbar() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const adminLink = document.getElementById("admin-link");
  const profileLink = document.querySelector('a[href="profile.html"]');
  const signupLink = document.querySelector('a[href="signup.html"]');
  const studentAreaLink = document.querySelector('a[href="student-area.html"]');
  const cardRegistrationLink = document.querySelector('a[href="card-registration.html"]');

  if (!(loginButton && logoutButton)) {
    console.warn("Elementos da navbar (loginButton ou logoutButton) não encontrados.");
    return;
  }

  if (loggedInUser) {
    loginButton.style.display = "none";
    logoutButton.style.display = "inline-block";
    if (profileLink) profileLink.style.display = "inline-block";
    if (studentAreaLink) studentAreaLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "none";
    if (adminLink) {
      adminLink.style.display = loggedInUser === "admin@admin.com" ? "inline-block" : "none";
    }
    if (cardRegistrationLink) cardRegistrationLink.style.display = "inline-block";
  } else {
    loginButton.style.display = "inline-block";
    logoutButton.style.display = "none";
    if (profileLink) profileLink.style.display = "none";
    if (studentAreaLink) studentAreaLink.style.display = "none";
    if (signupLink) signupLink.style.display = "inline-block";
    if (adminLink) adminLink.style.display = "none";
    if (cardRegistrationLink) cardRegistrationLink.style.display = "none";
  }
}

// Função para logout
function logout() {
  localStorage.removeItem("loggedInUser");
  updateNavbar();
  window.location.href = "login.html";
}

// Evento principal ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) logoutButton.addEventListener("click", logout);

  const loginButton = document.getElementById("login-button");
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      console.log("Botão Login clicado, redirecionando para login.html");
      window.location.href = "login.html";
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email")?.value;
      const password = document.getElementById("password")?.value;

      if (!email || !password) {
        alert("Por favor, preencha e-mail e senha.");
        return;
      }

      try {
        const response = await fetch("/.netlify/functions/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro HTTP: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result.success) {
          localStorage.setItem("loggedInUser", email);
          updateNavbar();
          window.location.href = "dashboard.html";
        } else {
          alert(result.message || "Falha no login.");
        }
      } catch (error) {
        console.error("Erro na requisição de login:", error);
        alert("Erro ao tentar fazer login. Verifique o console.");
      }
    });
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name")?.value;
      const email = document.getElementById("email")?.value;
      const phone = document.getElementById("phone")?.value;
      const password = document.getElementById("password")?.value;

      if (!name || !email || !phone || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      try {
        const response = await fetch("/.netlify/functions/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro HTTP: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result.success) {
          alert("Cadastro realizado com sucesso! Faça login para continuar.");
          window.location.href = "login.html";
        } else {
          alert(result.message || "Falha no cadastro.");
        }
      } catch (error) {
        console.error("Erro na requisição de signup:", error);
        alert("Erro ao tentar cadastrar. Verifique o console.");
      }
    });
  }

  // Adicionar alimento dinamicamente no formulário de dieta
  const addFoodButton = document.getElementById("add-food");
  const foodsListForAdd = document.getElementById("foods-list");
  if (addFoodButton && foodsListForAdd) {
    addFoodButton.addEventListener("click", () => {
      const newFoodEntry = document.createElement("div");
      newFoodEntry.classList.add("food-entry");
      newFoodEntry.innerHTML = `
        <div class="food-field">
          <label for="food-name">Alimento</label>
          <input type="text" name="food-name" placeholder="Ex.: Frango Grelhado" required>
        </div>
        <div class="food-field">
          <label for="food-quantity">Quantidade</label>
          <input type="text" name="food-quantity" placeholder="Ex.: 100g" required>
        </div>
        <button type="button" class="remove-food">Remover</button>
      `;
      foodsListForAdd.appendChild(newFoodEntry);

      newFoodEntry.querySelector(".remove-food").addEventListener("click", () => {
        if (foodsListForAdd.children.length > 1) {
          foodsListForAdd.removeChild(newFoodEntry);
        } else {
          alert("Você deve ter pelo menos um alimento.");
        }
      });
    });
  }

  // Evento para remover alimento no formulário
  const foodsList = document.getElementById("foods-list");
  if (foodsList) {
    foodsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-food")) {
        const foodEntry = e.target.parentElement;
        if (foodsList.children.length > 1) {
          foodsList.removeChild(foodEntry);
        } else {
          alert("Você deve ter pelo menos um alimento.");
        }
      }
    });
  }

  // Adicionar nova dieta
  const addDietForm = document.getElementById("add-diet-form");
  if (addDietForm) {
    addDietForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = localStorage.getItem("loggedInUser");
      if (!email) {
        window.location.href = "login.html";
        return;
      }

      const day = document.getElementById("diet-day")?.value;
      const meal = document.getElementById("diet-meal")?.value;
      const foods = Array.from(document.querySelectorAll("#foods-list .food-entry"))
        .map((entry) => {
          const name = entry.querySelector('input[name="food-name"]')?.value;
          const quantity = entry.querySelector('input[name="food-quantity"]')?.value;
          return { name, quantity };
        })
        .filter((food) => food.name?.trim() && food.quantity?.trim());

      if (!day || !meal || foods.length === 0) {
        alert("Preencha o dia, a refeição e adicione pelo menos um alimento.");
        return;
      }

      try {
        const response = await fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const diets = await response.json() || [];
        const existingDietIndex = diets.findIndex((d) => d.day === day && d.meal === meal);
        if (existingDietIndex !== -1) {
          alert("Já existe uma dieta para este dia e refeição. Edite ou exclua a dieta existente.");
          return;
        }

        diets.push({ day, meal, foods });
        const saveResponse = await fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diets),
        });

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          throw new Error(`Erro ao salvar dieta: ${saveResponse.status} ${saveResponse.statusText} - ${errorText}`);
        }

        location.reload();
      } catch (error) {
        console.error("Erro ao adicionar dieta:", error);
        alert("Erro ao adicionar dieta. Verifique o console.");
      }
    });
  }

  // Carregar dietas na página student-area
  const dietsBody = document.getElementById("diets-body");
  if (dietsBody) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      window.location.href = "login.html";
      return;
    }

    fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${text}`);
          });
        }
        return response.json();
      })
      .then((diets) => {
        if (!Array.isArray(diets)) {
          throw new Error("A resposta não é um array de dietas.");
        }
        diets.forEach((diet, index) => {
          const row = document.createElement("tr");
          const foodsList = diet.foods
            .map((food, foodIndex) => `
              <div class="food-item">
                ${food.name} (${food.quantity})
                <button onclick="removeFood(${index}, ${foodIndex})">Remover</button>
              </div>
            `)
            .join("");
          row.innerHTML = `
            <td>${diet.day}</td>
            <td>${diet.meal}</td>
            <td>
              ${foodsList}
              <button onclick="addFoodToDiet(${index})">Adicionar Alimento</button>
            </td>
            <td>
              <button onclick="editDiet(${index})">Editar</button>
              <button onclick="deleteDiet(${index})">Excluir</button>
            </td>
          `;
          dietsBody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar dietas:", error);
        alert("Erro ao carregar dietas. Verifique o console.");
      });
  }

  // Adicionar peso
  const addWeightForm = document.getElementById("add-weight-form");
  if (addWeightForm) {
    addWeightForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = localStorage.getItem("loggedInUser");
      if (!email) {
        window.location.href = "login.html";
        return;
      }

      const date = document.getElementById("weight-date")?.value;
      const weight = parseFloat(document.getElementById("weight-value")?.value);

      if (!date || isNaN(weight)) {
        alert("Por favor, preencha a data e o peso corretamente.");
        return;
      }

      try {
        const response = await fetch(`/.netlify/functions/weights?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao carregar pesos: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const weights = await response.json() || [];

        weights.push({ date, weight });
        weights.sort((a, b) => new Date(a.date) - new Date(b.date));

        const saveResponse = await fetch(`/.netlify/functions/weights?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(weights),
        });

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          throw new Error(`Erro ao salvar pesos: ${saveResponse.status} ${saveResponse.statusText} - ${errorText}`);
        }

        location.reload();
      } catch (error) {
        console.error("Erro ao adicionar peso:", error);
        alert("Erro ao adicionar peso. Verifique o console.");
      }
    });
  }

  // Carregar pesos e renderizar gráfico
  const weightsBody = document.getElementById("weights-body");
  const weightChartCanvas = document.getElementById("weight-chart");
  if (weightsBody && weightChartCanvas) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      window.location.href = "login.html";
      return;
    }

    fetch(`/.netlify/functions/weights?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro ao carregar pesos: ${response.status} ${response.statusText} - ${text}`);
          });
        }
        return response.json();
      })
      .then((weights) => {
        weights = Array.isArray(weights) ? weights : [];
        weights.forEach((entry, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString("pt-BR")}</td>
            <td>${entry.weight} kg</td>
            <td>
              <button onclick="deleteWeight(${index})">Excluir</button>
            </td>
          `;
          weightsBody.appendChild(row);
        });

        const labels = weights.map((entry) => new Date(entry.date).toLocaleDateString("pt-BR"));
        const data = weights.map((entry) => entry.weight);

        new Chart(weightChartCanvas, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Peso (kg)",
                data: data,
                borderColor: "#E30613",
                backgroundColor: "rgba(227, 6, 19, 0.2)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#FFC107",
                pointBorderColor: "#FFFFFF",
                pointHoverBackgroundColor: "#FFCA28",
                pointHoverBorderColor: "#FFFFFF",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                labels: {
                  color: "#FFFFFF",
                  font: { family: "Montserrat" },
                },
              },
              tooltip: {
                backgroundColor: "#333",
                titleColor: "#FFFFFF",
                bodyColor: "#FFFFFF",
                borderColor: "#E30613",
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                ticks: { color: "#FFFFFF", font: { family: "Montserrat" } },
                grid: { color: "rgba(255, 255, 255, 0.1)" },
              },
              y: {
                ticks: {
                  color: "#FFFFFF",
                  font: { family: "Montserrat" },
                  callback: function (value) { return value + " kg"; },
                },
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                beginAtZero: false,
              },
            },
          },
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar pesos:", error);
        alert("Erro ao carregar pesos. Verifique o console.");
      });
  }

  // Adicionar exercício dinamicamente no formulário de treino
  const addExerciseButton = document.getElementById("add-exercise");
  const exercisesListForAdd = document.getElementById("exercises-list");
  if (addExerciseButton && exercisesListForAdd) {
    addExerciseButton.addEventListener("click", () => {
      const newExerciseEntry = document.createElement("div");
      newExerciseEntry.classList.add("exercise-entry");
      newExerciseEntry.innerHTML = `
        <div class="exercise-field">
          <label for="exercise-name">Exercício</label>
          <input type="text" name="exercise-name" placeholder="Ex: Supino Reto" required>
        </div>
        <div class="exercise-field">
          <label for="exercise-sets">Séries</label>
          <input type="number" name="exercise-sets" placeholder="Ex: 4" min="1" required>
        </div>
        <div class="exercise-field">
          <label for="exercise-reps">Repetições</label>
          <input type="number" name="exercise-reps" placeholder="Ex: 10" min="1" required>
        </div>
        <button type="button" class="remove-exercise">Remover</button>
      `;
      exercisesListForAdd.appendChild(newExerciseEntry);

      newExerciseEntry.querySelector(".remove-exercise").addEventListener("click", () => {
        if (exercisesListForAdd.children.length > 1) {
          exercisesListForAdd.removeChild(newExerciseEntry);
        } else {
          alert("Você deve ter pelo menos um exercício.");
        }
      });
    });
  }

  const exercisesList = document.getElementById("exercises-list");
  if (exercisesList) {
    exercisesList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-exercise")) {
        const exerciseEntry = e.target.parentElement;
        if (exercisesList.children.length > 1) {
          exercisesList.removeChild(exerciseEntry);
        } else {
          alert("Você deve ter pelo menos um exercício.");
        }
      }
    });
  }

  const addWorkoutForm = document.getElementById("add-workout-form");
  if (addWorkoutForm) {
    addWorkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = localStorage.getItem("loggedInUser");
      if (!email) {
        window.location.href = "login.html";
        return;
      }

      const day = document.getElementById("new-day")?.value;
      const title = document.getElementById("new-title")?.value;
      const exercises = Array.from(document.querySelectorAll("#exercises-list .exercise-entry"))
        .map((entry) => {
          const name = entry.querySelector('input[name="exercise-name"]')?.value;
          const sets = entry.querySelector('input[name="exercise-sets"]')?.value;
          const reps = entry.querySelector('input[name="exercise-reps"]')?.value;
          return { name, sets, reps };
        })
        .filter((exercise) => exercise.name?.trim() && exercise.sets && exercise.reps);

      if (!day || !title || exercises.length === 0) {
        alert("Preencha o dia, título e adicione pelo menos um exercício.");
        return;
      }

      try {
        const response = await fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const workouts = await response.json() || [];

        const existingDayIndex = workouts.findIndex((w) => w.day === day);
        if (existingDayIndex !== -1) {
          alert("Já existe um treino para este dia. Edite ou exclua o treino existente.");
          return;
        }

        workouts.push({ day, title, exercises });
        const saveResponse = await fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workouts),
        });

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          throw new Error(`Erro ao salvar treino: ${saveResponse.status} ${saveResponse.statusText} - ${errorText}`);
        }

        location.reload();
      } catch (error) {
        console.error("Erro ao adicionar treino:", error);
        alert("Erro ao adicionar treino. Verifique o console.");
      }
    });
  }

  const workoutsBody = document.getElementById("workouts-body");
  if (workoutsBody) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      window.location.href = "login.html";
      return;
    }

    fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${text}`);
          });
        }
        return response.json();
      })
      .then((workouts) => {
        workouts = Array.isArray(workouts) ? workouts : [];
        workouts.forEach((workout, index) => {
          const row = document.createElement("tr");
          const exercisesList = workout.exercises
            .map((exercise, exIndex) => `
              <div class="exercise-item">
                ${exercise.name}: ${exercise.sets} séries de ${exercise.reps} repetições
                <button onclick="removeExercise(${index}, ${exIndex})">Remover</button>
              </div>
            `)
            .join("");
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
      .catch((error) => {
        console.error("Erro ao carregar treinos:", error);
        alert("Erro ao carregar treinos. Verifique o console.");
      });
  }

  // Carregar dados dos usuários na página admin.html
  const usersTableBody = document.getElementById("users-table-body");
  if (usersTableBody) {
    const email = localStorage.getItem("loggedInUser");
    if (!email || email !== "admin@admin.com") {
      window.location.href = "login.html";
      return;
    }

    fetch("/.netlify/functions/admin-data", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText} - ${text}`);
          });
        }
        return response.json();
      })
      .then((users) => {
        if (!Array.isArray(users)) {
          throw new Error("A resposta não é um array de usuários.");
        }

        const noUsersMessage = document.getElementById("no-users-message");
        if (!users || users.length === 0) {
          noUsersMessage.style.display = "block";
        } else {
          noUsersMessage.style.display = "none";
          users.forEach((user) => {
            const row = document.createElement("tr");
            const workoutsList = (user.workouts || [])
              .map((w) => `
                ${w.day} (${w.title}):<br>
                ${w.exercises
                  .map((ex) => `- ${ex.name}: ${ex.sets} séries de ${ex.reps} repetições`)
                  .join("<br>")}
              `)
              .join("<br><br>");
            row.innerHTML = `
              <td>${user.email || "N/A"}</td>
              <td>${user.password || "N/A"}</td>
              <td>${workoutsList || "Nenhum treino"}</td>
            `;
            usersTableBody.appendChild(row);
          });
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar dados dos usuários:", error);
        const noUsersMessage = document.getElementById("no-users-message");
        noUsersMessage.innerText = "Erro ao carregar os dados dos usuários. Verifique o console.";
        noUsersMessage.style.display = "block";
      });
  }

  // Carregar matrículas na página admin.html
  const enrollmentsBody = document.getElementById("enrollments-body");
  if (enrollmentsBody) {
    const email = localStorage.getItem("loggedInUser");
    if (!email || email !== "admin@admin.com") {
      window.location.href = "login.html";
      return;
    }

    fetch("/.netlify/functions/enrollments", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro na requisição de matrículas: ${response.status} ${response.statusText} - ${text}`);
          });
        }
        return response.json();
      })
      .then((enrollments) => {
        if (!Array.isArray(enrollments)) {
          throw new Error("A resposta não é um array de matrículas.");
        }

        const noEnrollmentsMessage = document.getElementById("no-enrollments-message");
        if (enrollments.length === 0) {
          noEnrollmentsMessage.style.display = "block";
          noEnrollmentsMessage.innerText = "Nenhuma matrícula encontrada.";
        } else {
          noEnrollmentsMessage.style.display = "none";
          enrollments.forEach((enrollment, index) => {
            try {
              console.log(`Processando matrícula ${index}:`, enrollment);
              const row = document.createElement("tr");
              row.innerHTML = `
                <td>${enrollment.name || "N/A"}</td>
                <td>${enrollment.email || "N/A"}</td>
                <td>${enrollment.phone || "N/A"}</td>
                <td>${censorCardNumber(enrollment.cardNumber) || "N/A"}</td>
                <td>${censorExpiry(enrollment.cardExpiry) || "N/A"}</td>
                <td>${censorCvc(enrollment.cardCvc) || "N/A"}</td>
                <td>${enrollment.plan || "N/A"}</td>
                <td>${enrollment.registrationDate ? new Date(enrollment.registrationDate).toLocaleString("pt-BR") : "N/A"}</td>
              `;
              enrollmentsBody.appendChild(row);
            } catch (error) {
              console.error(`Erro ao processar matrícula ${index}:`, error, "Dados:", enrollment);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar matrículas:", error);
        const noEnrollmentsMessage = document.getElementById("no-enrollments-message");
        noEnrollmentsMessage.innerText = `Erro ao carregar as matrículas. Verifique o console. Detalhes: ${error.message}`;
        noEnrollmentsMessage.style.display = "block";
      });
  }

  const imcForm = document.getElementById("imc-form");
  if (imcForm) {
    imcForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const weight = parseFloat(document.getElementById("weight")?.value);
      const height = parseFloat(document.getElementById("height")?.value);
      if (isNaN(weight) || isNaN(height) || height === 0) {
        alert("Por favor, insira valores válidos para peso e altura.");
        return;
      }
      const imc = (weight / (height * height)).toFixed(2);
      document.getElementById("imc-result").innerText = `Seu IMC é: ${imc}`;
    });
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      contactForm.reset();
    });
  }

  // Lógica para cadastro de cartão
  const cardRegistrationForm = document.getElementById("card-registration-form");
  if (cardRegistrationForm) {
    cardRegistrationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const enrollmentData = {
        name: document.getElementById("enrollment-name")?.value?.trim(),
        email: document.getElementById("enrollment-email")?.value?.trim(),
        phone: document.getElementById("enrollment-phone")?.value?.trim(),
        cardNumber: document.getElementById("card-number")?.value?.replace(/\D/g, ""),
        cardExpiry: document.getElementById("card-expiry")?.value?.trim(),
        cardCvc: document.getElementById("card-cvc")?.value?.trim(),
        plan: document.getElementById("selected-plan")?.value?.trim() || "Plano Básico",
        registrationDate: new Date().toISOString(),
      };

      if (!enrollmentData.name || !enrollmentData.email || !enrollmentData.phone ||
          !enrollmentData.cardNumber || !enrollmentData.cardExpiry || !enrollmentData.cardCvc ||
          !enrollmentData.plan) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
      }

      try {
        console.log("Enviando dados para o servidor:", enrollmentData);
        const response = await fetch("/.netlify/functions/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrollmentData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao realizar matrícula: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Resposta do servidor:", result);

        if (result.success) {
          alert("Matrícula realizada com sucesso! Redirecionando para o login.");
          window.location.href = "login.html";
        } else {
          alert(result.message || "Erro ao realizar matrícula.");
        }
      } catch (error) {
        console.error("Erro ao realizar matrícula:", error);
        alert("Erro ao realizar matrícula. Verifique o console.");
      }
    });

    const cardNumberInput = document.getElementById("card-number");
    const cardIcon = document.getElementById("card-icon");
    if (cardNumberInput && cardIcon) {
      cardNumberInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        let formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
        e.target.value = formattedValue;

        const cardType = identifyCardType(value);
        if (cardType) {
          cardIcon.src = `images/${cardType}.png`;
          cardIcon.style.display = "inline-block";
        } else {
          cardIcon.style.display = "none";
        }
      });
    }
  }
});

// Função para identificar a bandeira do cartão
function identifyCardType(number) {
  if (!number) return null;

  const cardPatterns = {
    visa: /^4/,
    mastercard: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/,
  };

  for (const [cardType, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(number)) return cardType;
  }
  return null;
}

// Funções para censurar informações sensíveis do cartão
function censorCardNumber(cardNumber) {
  if (!cardNumber) return "N/A";
  const lastFour = cardNumber.slice(-4).padStart(cardNumber.length, "*");
  return lastFour.replace(/(\d{4})/g, "$1 ").trim();
}

function censorExpiry(expiry) {
  if (!expiry || typeof expiry !== "string") return "N/A";
  if (expiry.length === 4 && /^\d{4}$/.test(expiry)) {
    const month = expiry.slice(0, 2);
    const year = expiry.slice(2, 4);
    return `${month}/*${year.slice(-1)}`;
  }
  const parts = expiry.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return "N/A";
  const [month, year] = parts;
  return `${month}/X${year.slice(-1)}`;
}

function censorCvc(cvc) {
  if (!cvc) return "N/A";
  return "*".repeat(cvc.length - 1) + cvc.slice(-1);
}

// Funções para dietas
function editDiet(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((diets) => {
      const diet = diets[index];
      const row = document.getElementById("diets-body")?.children[index];
      if (!row) return;
      row.innerHTML = `
        <td>
          <select id="edit-diet-day-${index}">
            <option value="Segunda" ${diet.day === "Segunda" ? "selected" : ""}>Segunda</option>
            <option value="Terça" ${diet.day === "Terça" ? "selected" : ""}>Terça</option>
            <option value="Quarta" ${diet.day === "Quarta" ? "selected" : ""}>Quarta</option>
            <option value="Quinta" ${diet.day === "Quinta" ? "selected" : ""}>Quinta</option>
            <option value="Sexta" ${diet.day === "Sexta" ? "selected" : ""}>Sexta</option>
            <option value="Sábado" ${diet.day === "Sábado" ? "selected" : ""}>Sábado</option>
            <option value="Domingo" ${diet.day === "Domingo" ? "selected" : ""}>Domingo</option>
          </select>
        </td>
        <td>
          <select id="edit-diet-meal-${index}">
            <option value="Café da Manhã" ${diet.meal === "Café da Manhã" ? "selected" : ""}>Café da Manhã</option>
            <option value="Lanche da Manhã" ${diet.meal === "Lanche da Manhã" ? "selected" : ""}>Lanche da Manhã</option>
            <option value="Almoço" ${diet.meal === "Almoço" ? "selected" : ""}>Almoço</option>
            <option value="Lanche da Tarde" ${diet.meal === "Lanche da Tarde" ? "selected" : ""}>Lanche da Tarde</option>
            <option value="Jantar" ${diet.meal === "Jantar" ? "selected" : ""}>Jantar</option>
            <option value="Ceia" ${diet.meal === "Ceia" ? "selected" : ""}>Ceia</option>
          </select>
        </td>
        <td>
          <div id="edit-foods-${index}">
            ${diet.foods.map((food, foodIndex) => `
              <div class="food-item">
                <input type="text" name="edit-food-name-${index}-${foodIndex}" value="${food.name}">
                <input type="text" name="edit-food-quantity-${index}-${foodIndex}" value="${food.quantity}">
                <button onclick="removeFoodDuringEdit(${index}, ${foodIndex})">Remover</button>
              </div>
            `).join("")}
          </div>
          <button onclick="addFoodDuringEdit(${index})">Adicionar Alimento</button>
        </td>
        <td>
          <button onclick="saveDiet(${index})">Salvar</button>
          <button onclick="cancelDietEdit(${index})">Cancelar</button>
        </td>
      `;
    })
    .catch((error) => {
      console.error("Erro ao editar dieta:", error);
      alert("Erro ao editar dieta. Verifique o console.");
    });
}

function addFoodDuringEdit(index) {
  const foodsDiv = document.getElementById(`edit-foods-${index}`);
  if (!foodsDiv) return;
  const foodIndex = foodsDiv.children.length;
  const newFood = document.createElement("div");
  newFood.classList.add("food-item");
  newFood.innerHTML = `
    <input type="text" name="edit-food-name-${index}-${foodIndex}" placeholder="Novo alimento">
    <input type="text" name="edit-food-quantity-${index}-${foodIndex}" placeholder="Quantidade">
    <button onclick="removeFoodDuringEdit(${index}, ${foodIndex})">Remover</button>
  `;
  foodsDiv.appendChild(newFood);
}

function removeFoodDuringEdit(index, foodIndex) {
  const foodsDiv = document.getElementById(`edit-foods-${index}`);
  if (!foodsDiv) return;
  if (foodsDiv.children.length > 1) {
    foodsDiv.removeChild(foodsDiv.children[foodIndex]);
  } else {
    alert("Você deve ter pelo menos um alimento.");
  }
}

function saveDiet(index) {
  const email = localStorage.getItem("loggedInUser");
  const day = document.getElementById(`edit-diet-day-${index}`)?.value;
  const meal = document.getElementById(`edit-diet-meal-${index}`)?.value;
  const foods = Array.from(document.querySelectorAll(`#edit-foods-${index} .food-item`))
    .map((entry, foodIndex) => {
      const name = entry.querySelector(`input[name="edit-food-name-${index}-${foodIndex}"]`)?.value;
      const quantity = entry.querySelector(`input[name="edit-food-quantity-${index}-${foodIndex}"]`)?.value;
      return { name, quantity };
    })
    .filter((food) => food.name?.trim() && food.quantity?.trim());

  if (!day || !meal || foods.length === 0) {
    alert("Preencha o dia, a refeição e adicione pelo menos um alimento.");
    return;
  }

  fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((diets) => {
      const existingDietIndex = diets.findIndex((d, i) => d.day === day && d.meal === meal && i !== index);
      if (existingDietIndex !== -1) {
        alert("Já existe uma dieta para este dia e refeição. Escolha outra combinação ou exclua a dieta existente.");
        return;
      }

      diets[index] = { day, meal, foods };
      return fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diets),
      });
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao salvar dieta: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao salvar dieta:", error);
      alert("Erro ao salvar dieta. Verifique o console.");
    });
}

function cancelDietEdit(index) {
  location.reload();
}

function deleteDiet(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((diets) => {
      diets.splice(index, 1);
      return fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diets),
      });
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao excluir dieta: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao excluir dieta:", error);
      alert("Erro ao excluir dieta. Verifique o console.");
    });
}

function addFoodToDiet(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((diets) => {
      const name = prompt("Digite o nome do alimento (ex.: Frango Grelhado):");
      const quantity = prompt("Digite a quantidade (ex.: 100g):");
      if (name?.trim() && quantity?.trim()) {
        diets[index].foods.push({ name, quantity });
        return fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diets),
        });
      }
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao adicionar alimento: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao adicionar alimento:", error);
      alert("Erro ao adicionar alimento. Verifique o console.");
    });
}

function removeFood(dietIndex, foodIndex) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar dietas: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((diets) => {
      if (diets[dietIndex].foods.length > 1) {
        diets[dietIndex].foods.splice(foodIndex, 1);
        return fetch(`/.netlify/functions/diets?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diets),
        });
      } else {
        alert('Você deve ter pelo menos um alimento. Para remover a dieta inteira, use o botão "Excluir".');
      }
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao remover alimento: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao remover alimento:", error);
      alert("Erro ao remover alimento. Verifique o console.");
    });
}

// Função para excluir peso
function deleteWeight(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/weights?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar pesos: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((weights) => {
      weights.splice(index, 1);
      return fetch(`/.netlify/functions/weights?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao excluir peso: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao excluir peso:", error);
      alert("Erro ao excluir peso. Verifique o console.");
    });
}

// Funções para treinos
function editWorkout(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((workouts) => {
      const workout = workouts[index];
      const row = document.getElementById("workouts-body")?.children[index];
      if (!row) return;
      row.innerHTML = `
        <td>
          <select id="edit-day-${index}">
            <option value="Segunda" ${workout.day === "Segunda" ? "selected" : ""}>Segunda</option>
            <option value="Terça" ${workout.day === "Terça" ? "selected" : ""}>Terça</option>
            <option value="Quarta" ${workout.day === "Quarta" ? "selected" : ""}>Quarta</option>
            <option value="Quinta" ${workout.day === "Quinta" ? "selected" : ""}>Quinta</option>
            <option value="Sexta" ${workout.day === "Sexta" ? "selected" : ""}>Sexta</option>
            <option value="Sábado" ${workout.day === "Sábado" ? "selected" : ""}>Sábado</option>
            <option value="Domingo" ${workout.day === "Domingo" ? "selected" : ""}>Domingo</option>
          </select>
        </td>
        <td><input type="text" id="edit-title-${index}" value="${workout.title}"></td>
        <td>
          <div id="edit-exercises-${index}">
            ${workout.exercises.map((exercise, exIndex) => `
              <div class="exercise-item">
                <input type="text" name="edit-exercise-name-${index}-${exIndex}" value="${exercise.name}">
                <input type="number" name="edit-exercise-sets-${index}-${exIndex}" value="${exercise.sets}" min="1">
                <input type="number" name="edit-exercise-reps-${index}-${exIndex}" value="${exercise.reps}" min="1">
                <button onclick="removeExerciseDuringEdit(${index}, ${exIndex})">Remover</button>
              </div>
            `).join("")}
          </div>
          <button onclick="addExerciseDuringEdit(${index})">Adicionar Exercício</button>
        </td>
        <td>
          <button onclick="saveWorkout(${index})">Salvar</button>
          <button onclick="cancelEdit(${index})">Cancelar</button>
        </td>
      `;
    })
    .catch((error) => {
      console.error("Erro ao editar treino:", error);
      alert("Erro ao editar treino. Verifique o console.");
    });
}

function addExerciseDuringEdit(index) {
  const exercisesDiv = document.getElementById(`edit-exercises-${index}`);
  if (!exercisesDiv) return;
  const exIndex = exercisesDiv.children.length;
  const newExercise = document.createElement("div");
  newExercise.classList.add("exercise-item");
  newExercise.innerHTML = `
    <input type="text" name="edit-exercise-name-${index}-${exIndex}" placeholder="Novo exercício">
    <input type="number" name="edit-exercise-sets-${index}-${exIndex}" placeholder="Séries" min="1">
    <input type="number" name="edit-exercise-reps-${index}-${exIndex}" placeholder="Repetições" min="1">
    <button onclick="removeExerciseDuringEdit(${index}, ${exIndex})">Remover</button>
  `;
  exercisesDiv.appendChild(newExercise);
}

function removeExerciseDuringEdit(index, exIndex) {
  const exercisesDiv = document.getElementById(`edit-exercises-${index}`);
  if (!exercisesDiv) return;
  if (exercisesDiv.children.length > 1) {
    exercisesDiv.removeChild(exercisesDiv.children[exIndex]);
  } else {
    alert("Você deve ter pelo menos um exercício.");
  }
}

function saveWorkout(index) {
  const email = localStorage.getItem("loggedInUser");
  const day = document.getElementById(`edit-day-${index}`)?.value;
  const title = document.getElementById(`edit-title-${index}`)?.value;
  const exercises = Array.from(document.querySelectorAll(`#edit-exercises-${index} .exercise-item`))
    .map((entry, exIndex) => {
      const name = entry.querySelector(`input[name="edit-exercise-name-${index}-${exIndex}"]`)?.value;
      const sets = entry.querySelector(`input[name="edit-exercise-sets-${index}-${exIndex}"]`)?.value;
      const reps = entry.querySelector(`input[name="edit-exercise-reps-${index}-${exIndex}"]`)?.value;
      return { name, sets, reps };
    })
    .filter((exercise) => exercise.name?.trim() && exercise.sets && exercise.reps);

  if (!day || !title || exercises.length === 0) {
    alert("Preencha o dia, título e adicione pelo menos um exercício.");
    return;
  }

  fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((workouts) => {
      const existingDayIndex = workouts.findIndex((w, i) => w.day === day && i !== index);
      if (existingDayIndex !== -1) {
        alert("Já existe um treino para este dia. Escolha outro dia ou exclua o treino existente.");
        return;
      }

      workouts[index] = { day, title, exercises };
      return fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workouts),
      });
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao salvar treino: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao salvar treino:", error);
      alert("Erro ao salvar treino. Verifique o console.");
    });
}

function cancelEdit(index) {
  location.reload();
}

function deleteWorkout(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((workouts) => {
      workouts.splice(index, 1);
      return fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workouts),
      });
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao excluir treino: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao excluir treino:", error);
      alert("Erro ao excluir treino. Verifique o console.");
    });
}

function addExerciseToDay(index) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((workouts) => {
      const name = prompt("Digite o nome do exercício (ex.: Supino Reto):");
      const sets = prompt("Digite o número de séries (ex.: 4):");
      const reps = prompt("Digite o número de repetições (ex.: 10):");
      if (name?.trim() && sets && reps) {
        workouts[index].exercises.push({ name, sets, reps });
        return fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workouts),
        });
      }
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao adicionar exercício: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao adicionar exercício:", error);
      alert("Erro ao adicionar exercício. Verifique o console.");
    });
}

function removeExercise(dayIndex, exIndex) {
  const email = localStorage.getItem("loggedInUser");
  fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao carregar treinos: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      return response.json();
    })
    .then((workouts) => {
      if (workouts[dayIndex].exercises.length > 1) {
        workouts[dayIndex].exercises.splice(exIndex, 1);
        return fetch(`/.netlify/functions/workouts?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workouts),
        });
      } else {
        alert('Você deve ter pelo menos um exercício. Para remover o dia inteiro, use o botão "Excluir".');
      }
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Erro ao remover exercício: ${response.status} ${response.statusText} - ${text}`);
        });
      }
      location.reload();
    })
    .catch((error) => {
      console.error("Erro ao remover exercício:", error);
      alert("Erro ao remover exercício. Verifique o console.");
    });
}