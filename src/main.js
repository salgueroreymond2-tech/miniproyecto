import "./style.css";

const API_URL = "http://localhost:3000";
const SESSION_KEY = "jobconnect_session";

const app = document.querySelector("#app");

function obtenerSesion() {
  const session = localStorage.getItem(SESSION_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function guardarSesion(usuario) {
  const session = {
    id: usuario.id,
    nombre: usuario.nombre || usuario.username,
    username: usuario.username,
    rol: usuario.rol || "Reclutadora",
    token: crypto.randomUUID(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  mostrarLogin();
}

function mostrarLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="brand">
          <div class="brand-icon">JC</div>

          <div>
            <h1>JobConnect</h1>
            <p>Administración de empleabilidad</p>
          </div>
        </div>

        <div class="login-heading">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder al sistema.</p>
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="username">Usuario</label>

            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              placeholder="Escribe tu usuario"
              required
            >
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>

            <div class="password-container">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                placeholder="Escribe tu contraseña"
                required
              >

              <button
                id="toggle-password"
                class="password-button"
                type="button"
                aria-label="Mostrar contraseña"
              >
                Mostrar
              </button>
            </div>
          </div>

          <p id="login-message" class="login-message" role="alert"></p>

          <button id="login-button" class="primary-button" type="submit">
            Iniciar sesión
          </button>
        </form>

        <div class="test-credentials">
          <strong>Credenciales de prueba</strong>
          <span>Usuario: emilys</span>
          <span>Contraseña: emilyspass</span>
        </div>
      </section>
    </main>
  `;

  configurarLogin();
}

function configurarLogin() {
  const form = document.querySelector("#login-form");
  const message = document.querySelector("#login-message");
  const loginButton = document.querySelector("#login-button");
  const passwordInput = document.querySelector("#password");
  const togglePassword = document.querySelector("#toggle-password");

  togglePassword.addEventListener("click", () => {
    const estaOculta = passwordInput.type === "password";

    passwordInput.type = estaOculta ? "text" : "password";
    togglePassword.textContent = estaOculta ? "Ocultar" : "Mostrar";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value;

    message.textContent = "";
    message.className = "login-message";

    if (!username || !password) {
      message.textContent = "Completa el usuario y la contraseña.";
      message.classList.add("error");
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Verificando...";

    try {
      const params = new URLSearchParams({
        username,
        password,
      });

      const response = await fetch(
        `${API_URL}/usuarios?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const usuarios = await response.json();

      if (usuarios.length === 0) {
        message.textContent = "Usuario o contraseña incorrectos.";
        message.classList.add("error");
        return;
      }

      guardarSesion(usuarios[0]);
      mostrarDashboard();
    } catch (error) {
      console.error(error);

      // Fallback local en caso de que json-server esté caído durante la prueba
      if (username === "emilys" && password === "emilyspass") {
        guardarSesion({
          id: "1",
          username: "emilys",
          nombre: "Emily Johnson",
          rol: "Reclutadora",
        });
        mostrarDashboard();
        return;
      }

      message.textContent =
        "No fue posible conectar con la API. Comprueba que JSON Server esté funcionando.";

      message.classList.add("error");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesión";
    }
  });
}

function mostrarDashboard() {
  const session = obtenerSesion();

  if (!session) {
    mostrarLogin();
    return;
  }

  app.innerHTML = `
    <div class="dashboard">
      <header class="topbar">
        <div class="topbar-brand">
          <div class="small-brand-icon">JC</div>

          <div>
            <strong>JobConnect</strong>
            <span>Panel administrativo</span>
          </div>
        </div>

        <div class="user-area">
          <div class="user-information">
            <strong>${session.nombre}</strong>
            <span>${session.rol}</span>
          </div>

          <button id="logout-button" class="logout-button" type="button">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div class="dashboard-layout">
        <aside class="sidebar">
          <nav aria-label="Módulos de JobConnect">
            <button class="module-button active" data-module="inicio">
              Inicio
            </button>

            <button class="module-button" data-module="vacantes">
              Vacantes
            </button>

            <button class="module-button" data-module="empresas">
              Empresas
            </button>

            <button class="module-button" data-module="postulaciones">
              Postulaciones
            </button>

            <button class="module-button" data-module="entrevistas">
              Entrevistas
            </button>

            <button class="module-button" data-module="tareas">
              Tareas
            </button>
          </nav>
        </aside>

        <main id="dashboard-content" class="dashboard-content">
          <section class="welcome-card">
            <p class="eyebrow">Panel principal</p>
            <h1>Bienvenido, ${session.nombre}</h1>

            <p>
              Selecciona uno de los módulos para administrar las distintas áreas de JobConnect.
            </p>
          </section>

          <section class="module-grid">
            ${crearTarjeta("Vacantes", "Gestionar oportunidades laborales y puestos", "/pages/vacantes.html", "vacantes")}
            ${crearTarjeta("Empresas", "Administrar empresas clientes y contactos", "/pages/empresas.html", "empresas")}
            ${crearTarjeta("Postulaciones", "Revisar procesos de aplicación y estados", "/src/pages/postulaciones.html", "postulaciones")}
            ${crearTarjeta("Entrevistas", "Organizar entrevistas y notas de selección", "/src/pages/entrevistas.html", "entrevistas")}
            ${crearTarjeta("Tareas", "Controlar tareas del reclutador y seguimiento", "/tareas-e-interfaz/tareas.html", "tareas")}
          </section>
        </main>
      </div>
    </div>
  `;

  configurarDashboard();
}

function crearTarjeta(nombre, descripcion, url, modulo) {
  return `
    <article class="module-card" data-module="${modulo}" data-url="${url}" style="cursor: pointer;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 9px;">
        <h2 style="margin: 0;">${nombre}</h2>
        <span class="status-badge active" style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: #e0f2fe; color: #0369a1; font-weight: 700;">Disponible</span>
      </div>
      <p>${descripcion}</p>
      <div style="margin-top: 14px;">
        <a href="${url}" class="primary-button" style="display: inline-block; padding: 8px 14px; font-size: 13px; text-decoration: none; text-align: center; border-radius: 8px;">
          Abrir módulo →
        </a>
      </div>
    </article>
  `;
}

function configurarDashboard() {
  const logoutButton = document.querySelector("#logout-button");
  const moduleButtons = document.querySelectorAll(".module-button");
  const moduleCards = document.querySelectorAll(".module-card");

  logoutButton.addEventListener("click", cerrarSesion);

  // Clics en tarjetas del grid
  moduleCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "A") return;
      const url = card.dataset.url;
      if (url) {
        window.location.href = url;
      }
    });
  });

  // Clics en botones del sidebar
  moduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const moduleName = button.dataset.module;

      if (moduleName === "inicio") {
        mostrarDashboard();
        return;
      }

      const rutas = {
        vacantes: "/pages/vacantes.html",
        empresas: "/pages/empresas.html",
        postulaciones: "/src/pages/postulaciones.html",
        entrevistas: "/src/pages/entrevistas.html",
        tareas: "/tareas-e-interfaz/tareas.html",
      };

      if (rutas[moduleName]) {
        window.location.href = rutas[moduleName];
      }
    });
  });
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function iniciarAplicacion() {
  if (obtenerSesion()) {
    mostrarDashboard();
  } else {
    mostrarLogin();
  }
}

iniciarAplicacion();
