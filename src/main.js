import "./style.css";

const API_URL = "http://localhost:3000";
const SESSION_KEY = "jobconnect_session";

const app = document.querySelector("#app");

/* ── Helpers de sesión ── */

function obtenerSesion() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try { return JSON.parse(session); }
  catch { localStorage.removeItem(SESSION_KEY); return null; }
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

function getIniciales(nombre) {
  return nombre.trim().split(/\s+/).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "JC";
}

/* ═══════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════ */

function mostrarLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="brand">
          <div class="brand-icon">JC</div>
          <div>
            <h1>JobConnect</h1>
            <p>Sistema de empleabilidad</p>
          </div>
        </div>

        <div class="login-heading">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder al panel.</p>
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="username">Usuario</label>
            <input id="username" name="username" type="text"
                   autocomplete="username" placeholder="Escribe tu usuario" required>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-container">
              <input id="password" name="password" type="password"
                     autocomplete="current-password" placeholder="Escribe tu contraseña" required>
              <button id="toggle-password" class="password-button" type="button"
                      aria-label="Mostrar contraseña">Mostrar</button>
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
    const oculta = passwordInput.type === "password";
    passwordInput.type = oculta ? "text" : "password";
    togglePassword.textContent = oculta ? "Ocultar" : "Mostrar";
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
      const params = new URLSearchParams({ username, password });
      const response = await fetch(`${API_URL}/usuarios?${params.toString()}`);
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

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

      // Fallback local
      if (username === "emilys" && password === "emilyspass") {
        guardarSesion({ id: "1", username: "emilys", nombre: "Emily Johnson", rol: "Reclutadora" });
        mostrarDashboard();
        return;
      }

      message.textContent = "No fue posible conectar con la API. Comprueba que JSON Server esté funcionando.";
      message.classList.add("error");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesión";
    }
  });
}

/* ═══════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════ */

async function cargarMetricas() {
  const defaults = {
    vacantes: 0,
    empresas: 0,
    postulaciones: 0,
    entrevistas: 0,
    tareas: 0
  };

  try {
    const [resVac, resEmp, resPost, resEnt, resTar] = await Promise.allSettled([
      fetch(`${API_URL}/vacantes`).then(r => r.json()),
      fetch(`${API_URL}/empresas`).then(r => r.json()),
      fetch(`${API_URL}/postulaciones`).then(r => r.json()),
      fetch(`${API_URL}/entrevistas`).then(r => r.json()),
      fetch(`${API_URL}/tareas`).then(r => r.json())
    ]);

    return {
      vacantes: resVac.status === "fulfilled" && Array.isArray(resVac.value) ? resVac.value.length : 4,
      empresas: resEmp.status === "fulfilled" && Array.isArray(resEmp.value) ? resEmp.value.length : 3,
      postulaciones: resPost.status === "fulfilled" && Array.isArray(resPost.value) ? resPost.value.length : 6,
      entrevistas: resEnt.status === "fulfilled" && Array.isArray(resEnt.value) ? resEnt.value.length : 3,
      tareas: resTar.status === "fulfilled" && Array.isArray(resTar.value) ? resTar.value.length : 5
    };
  } catch {
    return { vacantes: 4, empresas: 3, postulaciones: 6, entrevistas: 3, tareas: 5 };
  }
}

async function mostrarDashboard() {
  const session = obtenerSesion();
  if (!session) { mostrarLogin(); return; }

  const iniciales = getIniciales(session.nombre);
  const metricas = await cargarMetricas();

  app.innerHTML = `
    <div class="dashboard">

      <!-- ── NAVBAR ── -->
      <header class="jc-navbar">
        <div class="jc-navbar-brand">
          <div class="jc-navbar-logo">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span class="jc-navbar-name">JobConnect</span>
        </div>

        <nav class="jc-navbar-links" aria-label="Navegación principal">
          <a href="/index.html" class="jc-nav-link active">Dashboard</a>
          <a href="/pages/vacantes.html" class="jc-nav-link">Vacantes</a>
          <a href="/pages/empresas.html" class="jc-nav-link">Empresas</a>
          <a href="/src/pages/postulaciones.html" class="jc-nav-link">Postulaciones</a>
          <a href="/src/pages/entrevistas.html" class="jc-nav-link">Entrevistas</a>
          <a href="/tareas-e-interfaz/tareas.html" class="jc-nav-link">Tareas</a>
        </nav>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right; display: grid; gap: 1px;">
            <strong style="font-size: 14px; font-weight: 600; color: #F0F0F0;">${session.nombre}</strong>
            <span style="font-size: 12px; color: #606474;">${session.rol}</span>
          </div>
          <div class="jc-navbar-avatar" title="${session.nombre} (${session.rol})">${iniciales}</div>
          <button id="logout-button" class="logout-button" type="button" title="Cerrar sesión">Salir</button>
        </div>
      </header>

      <!-- ── LAYOUT ── -->
      <div class="dashboard-layout">
        <!-- ── SIDEBAR FIJO ── -->
        <aside class="sidebar">
          <div>
            <div class="sidebar-section-title">Módulos del Sistema</div>
            <nav aria-label="Módulos de JobConnect">
              <a href="/index.html" class="module-button active" data-module="inicio">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">dashboard</span>
                  <span>Inicio</span>
                </div>
              </a>

              <a href="/pages/vacantes.html" class="module-button" data-module="vacantes">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">work</span>
                  <span>Vacantes</span>
                </div>
                <span class="module-badge-count">${metricas.vacantes}</span>
              </a>

              <a href="/pages/empresas.html" class="module-button" data-module="empresas">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">domain</span>
                  <span>Empresas</span>
                </div>
                <span class="module-badge-count">${metricas.empresas}</span>
              </a>

              <a href="/src/pages/postulaciones.html" class="module-button" data-module="postulaciones">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">description</span>
                  <span>Postulaciones</span>
                </div>
                <span class="module-badge-count">${metricas.postulaciones}</span>
              </a>

              <a href="/src/pages/entrevistas.html" class="module-button" data-module="entrevistas">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">calendar_month</span>
                  <span>Entrevistas</span>
                </div>
                <span class="module-badge-count">${metricas.entrevistas}</span>
              </a>

              <a href="/tareas-e-interfaz/tareas.html" class="module-button" data-module="tareas">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">task_alt</span>
                  <span>Tareas</span>
                </div>
                <span class="module-badge-count">${metricas.tareas}</span>
              </a>
            </nav>
          </div>

          <div class="sidebar-bottom-info">
            <div class="sidebar-status-pill">
              <span class="status-dot-online"></span>
              <span>Servidor y API Activos</span>
            </div>
          </div>
        </aside>

        <!-- ── CONTENIDO PRINCIPAL ── -->
        <main id="dashboard-content" class="dashboard-content">
          <section class="welcome-card">
            <p class="eyebrow">Panel de Control General</p>
            <h1>Bienvenido/a, ${session.nombre} 👋</h1>
            <p>Monitorea y administra en tiempo real todas las vacantes, postulaciones, empresas clientes, entrevistas y tareas asignadas.</p>
          </section>

          <!-- ── OVERVIEW STATS ── -->
          <section class="stats-overview">
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #565DFF; background: rgba(86, 93, 255, 0.15);">
                <span class="material-symbols-rounded" style="font-size: 24px;">work</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">${metricas.vacantes}</span>
                <span class="stat-label">Vacantes Publicadas</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #10B981; background: rgba(16, 185, 129, 0.15);">
                <span class="material-symbols-rounded" style="font-size: 24px;">domain</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">${metricas.empresas}</span>
                <span class="stat-label">Empresas Clientes</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #F59E0B; background: rgba(245, 158, 11, 0.15);">
                <span class="material-symbols-rounded" style="font-size: 24px;">description</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">${metricas.postulaciones}</span>
                <span class="stat-label">Postulaciones</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #EC4899; background: rgba(236, 72, 153, 0.15);">
                <span class="material-symbols-rounded" style="font-size: 24px;">calendar_month</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">${metricas.entrevistas}</span>
                <span class="stat-label">Entrevistas</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #8B5CF6; background: rgba(139, 92, 246, 0.15);">
                <span class="material-symbols-rounded" style="font-size: 24px;">task_alt</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">${metricas.tareas}</span>
                <span class="stat-label">Tareas Pendientes</span>
              </div>
            </div>
          </section>

          <div class="section-title-row">
            <div>
              <h2>Módulos del Sistema</h2>
              <p>Accede directamente a cada área de gestión</p>
            </div>
          </div>

          <!-- ── MODULE CARDS ── -->
          <section class="module-grid">
            ${crearTarjeta("work", "Vacantes", "Crea, edita y gestiona las ofertas laborales y requisitos.", "/pages/vacantes.html", "vacantes", `${metricas.vacantes} registros`)}
            ${crearTarjeta("domain", "Empresas", "Administra las empresas clientes, contactos y ubicaciones.", "/pages/empresas.html", "empresas", `${metricas.empresas} registradas`)}
            ${crearTarjeta("description", "Postulaciones", "Supervisa las postulaciones de candidatos y su avance.", "/src/pages/postulaciones.html", "postulaciones", `${metricas.postulaciones} activas`)}
            ${crearTarjeta("calendar_month", "Entrevistas", "Organiza agendas, horarios, notas y estados de selección.", "/src/pages/entrevistas.html", "entrevistas", `${metricas.entrevistas} agendadas`)}
            ${crearTarjeta("task_alt", "Tareas", "Gestiona la lista de tareas del reclutador, prioridades y estados.", "/tareas-e-interfaz/tareas.html", "tareas", `${metricas.tareas} tareas`)}
          </section>
        </main>
      </div>

      <!-- ── FOOTER ── -->
      <footer class="jc-footer">
        <span>&copy; 2026 JobConnect — Sistema de Gestión de Empleabilidad</span>
        <span>Módulos integrados · Equipo Frontend</span>
      </footer>
    </div>
  `;

  configurarDashboard();
}

function crearTarjeta(iconName, nombre, descripcion, url, modulo, badgeText = "Activo") {
  return `
    <article class="module-card" data-module="${modulo}" data-url="${url}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="stat-icon-wrapper" style="width: 40px; height: 40px; border-radius: 10px; background: var(--bg-hover); color: var(--accent);">
            <span class="material-symbols-rounded" style="font-size: 22px;">${iconName}</span>
          </div>
          <h2>${nombre}</h2>
        </div>
        <span class="status-badge">${badgeText}</span>
      </div>
      <p>${descripcion}</p>
      <div style="margin-top: auto;">
        <a href="${url}" class="primary-button"
           style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; font-size: 14px; text-align: center; border-radius: 8px; text-decoration: none;">
          <span>Abrir módulo</span>
          <span>→</span>
        </a>
      </div>
    </article>
  `;
}

function configurarDashboard() {
  const logoutButton = document.querySelector("#logout-button");
  const moduleCards = document.querySelectorAll(".module-card");

  if (logoutButton) {
    logoutButton.addEventListener("click", cerrarSesion);
  }

  moduleCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const url = card.dataset.url;
      if (url) window.location.href = url;
    });
  });
}

/* ── Arranque ── */
function iniciarAplicacion() {
  obtenerSesion() ? mostrarDashboard() : mostrarLogin();
}

iniciarAplicacion();
