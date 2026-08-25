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
    rol: usuario.rol || "Reclutador",
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

            <button class="module-button" data-module="candidatos">
              Candidatos
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
              Selecciona uno de los módulos del menú para comenzar
              a administrar JobConnect.
            </p>
          </section>

          <section class="module-grid">
            ${crearTarjeta("Candidatos", "Administrar perfiles de candidatos", "candidatos")}
            ${crearTarjeta("Vacantes", "Gestionar oportunidades laborales", "vacantes")}
            ${crearTarjeta("Empresas", "Administrar empresas clientes", "empresas")}
            ${crearTarjeta("Postulaciones", "Revisar procesos de aplicación", "postulaciones")}
            ${crearTarjeta("Entrevistas", "Organizar entrevistas y notas", "entrevistas")}
            ${crearTarjeta("Tareas", "Controlar tareas de reclutamiento", "tareas", true)}
          </section>
        </main>
      </div>
    </div>
  `;

  configurarDashboard();
}

function crearTarjeta(nombre, descripcion, modulo, activo = false) {
  return `
    <article class="module-card ${activo ? 'module-card-active' : ''}" data-module="${modulo}" style="cursor: pointer;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 9px;">
        <h2 style="margin: 0;">${nombre}</h2>
        ${activo ? '<span class="status-badge active" style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: #e0f2fe; color: #0369a1; font-weight: 700;">Disponible</span>' : '<span class="status-badge" style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; color: #64748b; font-weight: 600;">En desarrollo</span>'}
      </div>
      <p>${descripcion}</p>
      ${activo ? '<div style="margin-top: 14px;"><a href="/tareas-e-interfaz/tareas.html" class="primary-button" style="display: inline-block; padding: 8px 14px; font-size: 13px; text-decoration: none; text-align: center; border-radius: 8px;">Ir al módulo →</a></div>' : ''}
    </article>
  `;
}

function configurarDashboard() {
  const logoutButton = document.querySelector("#logout-button");
  const moduleButtons = document.querySelectorAll(".module-button");
  const dashboardContent = document.querySelector("#dashboard-content");
  const moduleCards = document.querySelectorAll(".module-card");

  logoutButton.addEventListener("click", cerrarSesion);

  // Manejar clics en las tarjetas del dashboard
  moduleCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Si hizo clic directamente en el enlace <a>, dejar que navegue
      if (e.target.tagName === "A") return;

      const moduleName = card.dataset.module;
      if (moduleName === "tareas") {
        window.location.href = "/tareas-e-interfaz/tareas.html";
        return;
      }

      // Si es otro módulo, seleccionar en el sidebar
      const correspondingButton = document.querySelector(`.module-button[data-module="${moduleName}"]`);
      if (correspondingButton) {
        correspondingButton.click();
      }
    });
  });

  moduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moduleButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const moduleName = button.dataset.module;

      if (moduleName === "inicio") {
        mostrarDashboard();
        return;
      }

      if (moduleName === "tareas") {
        dashboardContent.innerHTML = `
          <section class="empty-module">
            <p class="eyebrow">Módulo</p>
            <h1>Gestión de Tareas</h1>

            <p style="margin-bottom: 20px;">
              El módulo de Gestión de Tareas está listo y funcional con CRUD completo,
              validaciones en tiempo real y persistencia en la API local.
            </p>

            <a href="/tareas-e-interfaz/tareas.html" class="primary-button" style="display: inline-block; padding: 12px 24px; text-decoration: none; text-align: center; max-width: 260px;">
              Abrir Gestión de Tareas →
            </a>
          </section>
        `;
        return;
      }

      dashboardContent.innerHTML = `
        <section class="empty-module">
          <p class="eyebrow">Módulo</p>
          <h1>${capitalizar(moduleName)}</h1>

          <p>
            Este espacio está preparado para integrar el módulo de
            ${moduleName} desarrollado por el equipo.
          </p>
        </section>
      `;
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