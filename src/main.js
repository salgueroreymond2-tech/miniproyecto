import "./style.css";

const API_URL = "http://localhost:3000";
const SESSION_KEY = "jobconnect_session";

const app = document.querySelector("#app");

<<<<<<< HEAD
/* =========================================================
   UTILIDADES
========================================================= */

function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* =========================================================
   SESI├ôN
========================================================= */

function obtenerSesion() {
  const sessionGuardada = localStorage.getItem(SESSION_KEY);

  if (!sessionGuardada) {
    return null;
  }

  try {
    const session = JSON.parse(sessionGuardada);

    if (
      !session ||
      !session.id ||
      !session.username ||
      !session.token
    ) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch (error) {
    console.error("La sesi├│n almacenada no es v├ílida:", error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
=======
/* ── Helpers de sesión ── */

function obtenerSesion() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try { return JSON.parse(session); }
  catch { localStorage.removeItem(SESSION_KEY); return null; }
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
}

function guardarSesion(usuario) {
  const session = {
    id: usuario.id,
    nombre: usuario.nombre || usuario.username,
    username: usuario.username,
    rol: usuario.rol || "Reclutador",
    token: crypto.randomUUID(),
  };
<<<<<<< HEAD

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
=======
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
}

function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  mostrarLogin();
}

<<<<<<< HEAD
/* =========================================================
   LOGIN Y REGISTRO
========================================================= */
=======
function getIniciales(nombre) {
  return nombre.trim().split(/\s+/).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "JC";
}

/* ═══════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════ */
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9

function mostrarLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <a href="/paginaPrincipal/paginaInicial.html" style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); text-decoration: none; font-size: 13px; margin-bottom: 18px; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-secondary)'">
          <span class="material-symbols-rounded" style="font-size: 16px;">arrow_back</span>
          <span>Volver al portal público</span>
        </a>

        <div class="brand">
          <div class="brand-icon">JC</div>
          <div>
            <h1>JobConnect</h1>
<<<<<<< HEAD
            <p>Administraci├│n de empleabilidad</p>
=======
            <p>Sistema de empleabilidad</p>
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
          </div>
        </div>

        <div class="login-heading">
<<<<<<< HEAD
          <h2>Iniciar sesi├│n</h2>

          <p>
            Ingresa tus credenciales para acceder al sistema.
          </p>
=======
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder al panel.</p>
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="username">Usuario</label>
            <input id="username" name="username" type="text"
                   autocomplete="username" placeholder="Escribe tu usuario" required>
          </div>

          <div class="form-group">
<<<<<<< HEAD
            <label for="password">Contrase├▒a</label>

            <div class="password-container">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                placeholder="Escribe tu contrase├▒a"
                required
              >

              <button
                id="toggle-password"
                class="password-button"
                type="button"
                aria-label="Mostrar contrase├▒a"
              >
                Mostrar
              </button>
=======
            <label for="password">Contraseña</label>
            <div class="password-container">
              <input id="password" name="password" type="password"
                     autocomplete="current-password" placeholder="Escribe tu contraseña" required>
              <button id="toggle-password" class="password-button" type="button"
                      aria-label="Mostrar contraseña">Mostrar</button>
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
            </div>
          </div>

          <p
            id="login-message"
            class="login-message"
            role="alert"
          ></p>

          <button
            id="login-button"
            class="primary-button"
            type="submit"
          >
            Iniciar sesi├│n
          </button>
        </form>

        <div class="test-credentials">
          <strong>Administrador predeterminado</strong>
          <span>Usuario: admin</span>
          <span>Contrase├▒a: admin1234</span>
        </div>

        <details class="register-panel">
          <summary>Registrar nuevo usuario</summary>

          <form id="register-form" novalidate>
            <div class="form-group">
              <label for="register-name">
                Nombre completo
              </label>

              <input
                id="register-name"
                name="name"
                type="text"
                autocomplete="name"
                placeholder="Ejemplo: Ernesto Libby"
                required
              >
            </div>

            <div class="form-group">
              <label for="register-username">
                Nombre de usuario
              </label>

              <input
                id="register-username"
                name="username"
                type="text"
                autocomplete="off"
                minlength="4"
                placeholder="M├¡nimo 4 caracteres"
                required
              >
            </div>

            <div class="form-group">
              <label for="register-password">
                Contrase├▒a
              </label>

              <div class="password-container">
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  minlength="6"
                  placeholder="M├¡nimo 6 caracteres"
                  required
                >

                <button
                  id="toggle-register-password"
                  class="password-button"
                  type="button"
                  aria-label="Mostrar contrase├▒a de registro"
                >
                  Mostrar
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="register-confirm-password">
                Confirmar contrase├▒a
              </label>

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                minlength="6"
                placeholder="Repite la contrase├▒a"
                required
              >
            </div>

            <p
              id="register-message"
              class="register-message"
              role="alert"
            ></p>

            <button
              id="register-button"
              class="secondary-button"
              type="submit"
            >
              Crear usuario
            </button>
          </form>
        </details>
      </section>
    </main>
  `;

  configurarLogin();
  configurarRegistro();
}

function configurarLogin() {
  const form = document.querySelector("#login-form");
  const message = document.querySelector("#login-message");
  const loginButton =
    document.querySelector("#login-button");

  const passwordInput =
    document.querySelector("#password");

  const togglePassword =
    document.querySelector("#toggle-password");

  togglePassword.addEventListener("click", () => {
<<<<<<< HEAD
    const estaOculta =
      passwordInput.type === "password";

    passwordInput.type =
      estaOculta ? "text" : "password";

    togglePassword.textContent =
      estaOculta ? "Ocultar" : "Mostrar";
=======
    const oculta = passwordInput.type === "password";
    passwordInput.type = oculta ? "text" : "password";
    togglePassword.textContent = oculta ? "Ocultar" : "Mostrar";
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
<<<<<<< HEAD

    const username =
      form.elements.username.value.trim().toLowerCase();
=======
    const username = form.username.value.trim();
    const password = form.password.value;
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9

    const password =
      form.elements.password.value;

    mostrarMensajeLogin("", "");

    if (!username || !password) {
      mostrarMensajeLogin(
        "Completa el usuario y la contrase├▒a.",
        "error"
      );

      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Verificando...";

    try {
<<<<<<< HEAD
      const usernameSeguro =
        encodeURIComponent(username);

      /*
       * Se consulta ├║nicamente por username.
       * La contrase├▒a se compara despu├®s para evitar colocarla
       * directamente dentro de la URL.
       */
      const response = await fetch(
        `${API_URL}/usuarios?username=${usernameSeguro}`
      );

      if (!response.ok) {
        throw new Error(
          `Error HTTP ${response.status}`
        );
      }

      const usuarios = await response.json();
      const usuario = usuarios[0];

      if (!usuario || usuario.password !== password) {
        mostrarMensajeLogin(
          "Usuario o contrase├▒a incorrectos.",
          "error"
        );

=======
      const params = new URLSearchParams({ username, password });
      const response = await fetch(`${API_URL}/usuarios?${params.toString()}`);
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

      const usuarios = await response.json();
      if (usuarios.length === 0) {
        message.textContent = "Usuario o contraseña incorrectos.";
        message.classList.add("error");
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
        return;
      }

      guardarSesion(usuario);
      mostrarDashboard();
    } catch (error) {
      console.error(
        "Error durante el inicio de sesi├│n:",
        error
      );

<<<<<<< HEAD
      mostrarMensajeLogin(
        "No fue posible conectar con la API. Comprueba que JSON Server est├® funcionando.",
        "error"
      );
=======
      // Fallback local
      if (username === "emilys" && password === "emilyspass") {
        guardarSesion({ id: "1", username: "emilys", nombre: "Emily Johnson", rol: "Reclutadora" });
        mostrarDashboard();
        return;
      }

      message.textContent = "No fue posible conectar con la API. Comprueba que JSON Server esté funcionando.";
      message.classList.add("error");
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesi├│n";
    }
  });
}

<<<<<<< HEAD
function mostrarMensajeLogin(texto, tipo) {
  const message =
    document.querySelector("#login-message");

  if (!message) {
    return;
=======
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
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
  }
}

async function mostrarDashboard() {
  const session = obtenerSesion();
  if (!session) { mostrarLogin(); return; }

  const iniciales = getIniciales(session.nombre);
  const metricas = await cargarMetricas();

  message.textContent = texto;
  message.className = "login-message";

  if (tipo) {
    message.classList.add(tipo);
  }
}

function configurarRegistro() {
  const form =
    document.querySelector("#register-form");

  const registerButton =
    document.querySelector("#register-button");

  const passwordInput =
    document.querySelector("#register-password");

  const confirmPasswordInput =
    document.querySelector(
      "#register-confirm-password"
    );

  const togglePassword =
    document.querySelector(
      "#toggle-register-password"
    );

  togglePassword.addEventListener("click", () => {
    const estaOculta =
      passwordInput.type === "password";

    const nuevoTipo =
      estaOculta ? "text" : "password";

    passwordInput.type = nuevoTipo;
    confirmPasswordInput.type = nuevoTipo;

    togglePassword.textContent =
      estaOculta ? "Ocultar" : "Mostrar";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre =
      form.elements.name.value.trim();

    const username =
      form.elements.username.value
        .trim()
        .toLowerCase();

    const password =
      form.elements.password.value;

    const confirmPassword =
      form.elements.confirmPassword.value;

    mostrarMensajeRegistro("", "");

    if (
      !nombre ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      mostrarMensajeRegistro(
        "Completa todos los campos.",
        "error"
      );

      return;
    }

    if (nombre.length < 3) {
      mostrarMensajeRegistro(
        "El nombre debe tener al menos 3 caracteres.",
        "error"
      );

      return;
    }

    if (username.length < 4) {
      mostrarMensajeRegistro(
        "El usuario debe tener al menos 4 caracteres.",
        "error"
      );

      return;
    }

    const formatoUsuario = /^[a-z0-9._-]+$/;

    if (!formatoUsuario.test(username)) {
      mostrarMensajeRegistro(
        "El usuario solo puede contener letras, n├║meros, puntos, guiones y guiones bajos.",
        "error"
      );

      return;
    }

    if (password.length < 6) {
      mostrarMensajeRegistro(
        "La contrase├▒a debe tener al menos 6 caracteres.",
        "error"
      );

      return;
    }

    if (password !== confirmPassword) {
      mostrarMensajeRegistro(
        "Las contrase├▒as no coinciden.",
        "error"
      );

      return;
    }

    registerButton.disabled = true;
    registerButton.textContent =
      "Creando usuario...";

    try {
      const usernameSeguro =
        encodeURIComponent(username);

      const searchResponse = await fetch(
        `${API_URL}/usuarios?username=${usernameSeguro}`
      );

      if (!searchResponse.ok) {
        throw new Error(
          `Error HTTP ${searchResponse.status}`
        );
      }

      const usuariosExistentes =
        await searchResponse.json();

      if (usuariosExistentes.length > 0) {
        mostrarMensajeRegistro(
          "Ese nombre de usuario ya existe.",
          "error"
        );

        return;
      }

      const nuevoUsuario = {
        nombre,
        username,
        password,
        rol: "Reclutador",
      };

      const createResponse = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(nuevoUsuario),
        }
      );

      if (!createResponse.ok) {
        throw new Error(
          `Error HTTP ${createResponse.status}`
        );
      }

      const usuarioCreado =
        await createResponse.json();

      mostrarMensajeRegistro(
        `Usuario ${usuarioCreado.username} creado correctamente. Ya puedes iniciar sesi├│n.`,
        "success"
      );

      const loginUsername =
        document.querySelector("#username");

      loginUsername.value =
        usuarioCreado.username;

      form.reset();
    } catch (error) {
      console.error(
        "Error al registrar usuario:",
        error
      );

      mostrarMensajeRegistro(
        "No fue posible crear el usuario. Comprueba que JSON Server est├® funcionando.",
        "error"
      );
    } finally {
      registerButton.disabled = false;
      registerButton.textContent =
        "Crear usuario";
    }
  });
}

function mostrarMensajeRegistro(texto, tipo) {
  const message =
    document.querySelector("#register-message");

  if (!message) {
    return;
  }

  message.textContent = texto;
  message.className = "register-message";

  if (tipo) {
    message.classList.add(tipo);
  }
}

/* =========================================================
   DASHBOARD
========================================================= */

function getIniciales(nombre) {
  return nombre.trim().split(/\s+/).map(p => p[0]).join("").toUpperCase().slice(0, 2) || "JC";
}


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

<<<<<<< HEAD
      <!-- ÔöÇÔöÇ NAVBAR ÔöÇÔöÇ -->
=======
      <!-- ── NAVBAR ── -->
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
      <header class="jc-navbar">
        <div class="jc-navbar-brand">
          <div class="jc-navbar-logo">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span class="jc-navbar-name">JobConnect</span>
        </div>

<<<<<<< HEAD
        <nav class="jc-navbar-links" aria-label="Navegaci├│n principal">
          <a href="/index.html" class="jc-nav-link active">Dashboard</a>
          <a href="/pages/vacantes.html" class="jc-nav-link">Vacantes</a>
          <a href="/pages/empresas.html" class="jc-nav-link">Empresas</a>
          <a href="/src/pages/postulaciones.html" class="jc-nav-link">Postulaciones</a>
          <a href="/src/pages/entrevistas.html" class="jc-nav-link">Entrevistas</a>
=======
        <nav class="jc-navbar-links" aria-label="Navegación principal">
          <a href="/index.html" class="jc-nav-link active">Dashboard</a>
          <a href="/vacantes/vacantes.html" class="jc-nav-link">Vacantes</a>
          <a href="/empresas/empresas.html" class="jc-nav-link">Empresas</a>
          <a href="/postulaciones/postulaciones.html" class="jc-nav-link">Postulaciones</a>
          <a href="/entrevistas/entrevistas.html" class="jc-nav-link">Entrevistas</a>
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
          <a href="/tareas-e-interfaz/tareas.html" class="jc-nav-link">Tareas</a>
        </nav>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right; display: grid; gap: 1px;">
            <strong style="font-size: 14px; font-weight: 600; color: #F0F0F0;">${session.nombre}</strong>
            <span style="font-size: 12px; color: #606474;">${session.rol}</span>
          </div>
          <div class="jc-navbar-avatar" title="${session.nombre} (${session.rol})">${iniciales}</div>
<<<<<<< HEAD
          <button id="logout-button" class="logout-button" type="button" title="Cerrar sesi├│n">Salir</button>
        </div>
      </header>

      <!-- ÔöÇÔöÇ LAYOUT ÔöÇÔöÇ -->
      <div class="dashboard-layout">
        <!-- ÔöÇÔöÇ SIDEBAR FIJO ÔöÇÔöÇ -->
        <aside class="sidebar">
          <div>
            <div class="sidebar-section-title">M├│dulos del Sistema</div>
            <nav aria-label="M├│dulos de JobConnect">
=======
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
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
              <a href="/index.html" class="module-button active" data-module="inicio">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">dashboard</span>
                  <span>Inicio</span>
                </div>
              </a>

<<<<<<< HEAD
              <a href="/pages/vacantes.html" class="module-button" data-module="vacantes">
=======
              <a href="/vacantes/vacantes.html" class="module-button" data-module="vacantes">
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">work</span>
                  <span>Vacantes</span>
                </div>
                <span class="module-badge-count">${metricas.vacantes}</span>
              </a>

<<<<<<< HEAD
              <a href="/pages/empresas.html" class="module-button" data-module="empresas">
=======
              <a href="/empresas/empresas.html" class="module-button" data-module="empresas">
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">domain</span>
                  <span>Empresas</span>
                </div>
                <span class="module-badge-count">${metricas.empresas}</span>
              </a>

<<<<<<< HEAD
              <a href="/src/pages/postulaciones.html" class="module-button" data-module="postulaciones">
=======
              <a href="/postulaciones/postulaciones.html" class="module-button" data-module="postulaciones">
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">description</span>
                  <span>Postulaciones</span>
                </div>
                <span class="module-badge-count">${metricas.postulaciones}</span>
              </a>

<<<<<<< HEAD
              <a href="/src/pages/entrevistas.html" class="module-button" data-module="entrevistas">
=======
              <a href="/entrevistas/entrevistas.html" class="module-button" data-module="entrevistas">
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
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

<<<<<<< HEAD
        <!-- ÔöÇÔöÇ CONTENIDO PRINCIPAL ÔöÇÔöÇ -->
        <main id="dashboard-content" class="dashboard-content">
          <section class="welcome-card">
            <p class="eyebrow">Panel de Control General</p>
            <h1>Bienvenido/a, ${session.nombre} ­ƒæï</h1>
            <p>Monitorea y administra en tiempo real todas las vacantes, postulaciones, empresas clientes, entrevistas y tareas asignadas.</p>
          </section>

          <!-- ÔöÇÔöÇ OVERVIEW STATS ÔöÇÔöÇ -->
=======
        <!-- ── CONTENIDO PRINCIPAL ── -->
        <main id="dashboard-content" class="dashboard-content">
          <section class="welcome-card">
            <p class="eyebrow">Panel de Control General</p>
            <h1>Bienvenido/a, ${session.nombre} 👋</h1>
            <p>Monitorea y administra en tiempo real todas las vacantes, postulaciones, empresas clientes, entrevistas y tareas asignadas.</p>
          </section>

          <!-- ── OVERVIEW STATS ── -->
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
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
<<<<<<< HEAD
              <h2>M├│dulos del Sistema</h2>
              <p>Accede directamente a cada ├írea de gesti├│n</p>
            </div>
          </div>

          <!-- ÔöÇÔöÇ MODULE CARDS ÔöÇÔöÇ -->
          <section class="module-grid">
            ${crearTarjeta("work", "Vacantes", "Crea, edita y gestiona las ofertas laborales y requisitos.", "/pages/vacantes.html", "vacantes", `${metricas.vacantes} registros`)}
            ${crearTarjeta("domain", "Empresas", "Administra las empresas clientes, contactos y ubicaciones.", "/pages/empresas.html", "empresas", `${metricas.empresas} registradas`)}
            ${crearTarjeta("description", "Postulaciones", "Supervisa las postulaciones de candidatos y su avance.", "/src/pages/postulaciones.html", "postulaciones", `${metricas.postulaciones} activas`)}
            ${crearTarjeta("calendar_month", "Entrevistas", "Organiza agendas, horarios, notas y estados de selecci├│n.", "/src/pages/entrevistas.html", "entrevistas", `${metricas.entrevistas} agendadas`)}
=======
              <h2>Módulos del Sistema</h2>
              <p>Accede directamente a cada área de gestión</p>
            </div>
          </div>

          <!-- ── MODULE CARDS ── -->
          <section class="module-grid">
            ${crearTarjeta("work", "Vacantes", "Crea, edita y gestiona las ofertas laborales y requisitos.", "/vacantes/vacantes.html", "vacantes", `${metricas.vacantes} registros`)}
            ${crearTarjeta("domain", "Empresas", "Administra las empresas clientes, contactos y ubicaciones.", "/empresas/empresas.html", "empresas", `${metricas.empresas} registradas`)}
            ${crearTarjeta("description", "Postulaciones", "Supervisa las postulaciones de candidatos y su avance.", "/postulaciones/postulaciones.html", "postulaciones", `${metricas.postulaciones} activas`)}
            ${crearTarjeta("calendar_month", "Entrevistas", "Organiza agendas, horarios, notas y estados de selección.", "/entrevistas/entrevistas.html", "entrevistas", `${metricas.entrevistas} agendadas`)}
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
            ${crearTarjeta("task_alt", "Tareas", "Gestiona la lista de tareas del reclutador, prioridades y estados.", "/tareas-e-interfaz/tareas.html", "tareas", `${metricas.tareas} tareas`)}
          </section>
        </main>
      </div>

<<<<<<< HEAD
      <!-- ÔöÇÔöÇ FOOTER ÔöÇÔöÇ -->
      <footer class="jc-footer">
        <span>&copy; 2026 JobConnect ÔÇö Sistema de Gesti├│n de Empleabilidad</span>
        <span>M├│dulos integrados ┬À Equipo Frontend</span>
=======
      <!-- ── FOOTER ── -->
      <footer class="jc-footer">
        <span>&copy; 2026 JobConnect — Sistema de Gestión de Empleabilidad</span>
        <span>Módulos integrados · Equipo Frontend</span>
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
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
<<<<<<< HEAD
          <span>Abrir m├│dulo</span>
          <span>ÔåÆ</span>
=======
          <span>Abrir módulo</span>
          <span>→</span>
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
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

<<<<<<< HEAD
/* ÔöÇÔöÇ Arranque ÔöÇÔöÇ */
=======
/* ── Arranque ── */
>>>>>>> 31e2313851acd9a046cd4f43133562e3626325e9
function iniciarAplicacion() {
  obtenerSesion() ? mostrarDashboard() : mostrarLogin();
}

iniciarAplicacion();
