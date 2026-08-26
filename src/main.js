import "./style.css";

const API_URL = "http://localhost:3000";
const SESSION_KEY = "jobconnect_session";

const app = document.querySelector("#app");

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
   SESIÓN
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
    console.error("La sesión almacenada no es válida:", error);
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

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
}

function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  mostrarLogin();
}

/* =========================================================
   LOGIN Y REGISTRO
========================================================= */

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

          <p>
            Ingresa tus credenciales para acceder al sistema.
          </p>
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
            Iniciar sesión
          </button>
        </form>

        <div class="test-credentials">
          <strong>Administrador predeterminado</strong>
          <span>Usuario: admin</span>
          <span>Contraseña: admin1234</span>
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
                placeholder="Mínimo 4 caracteres"
                required
              >
            </div>

            <div class="form-group">
              <label for="register-password">
                Contraseña
              </label>

              <div class="password-container">
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  minlength="6"
                  placeholder="Mínimo 6 caracteres"
                  required
                >

                <button
                  id="toggle-register-password"
                  class="password-button"
                  type="button"
                  aria-label="Mostrar contraseña de registro"
                >
                  Mostrar
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="register-confirm-password">
                Confirmar contraseña
              </label>

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                minlength="6"
                placeholder="Repite la contraseña"
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
    const estaOculta =
      passwordInput.type === "password";

    passwordInput.type =
      estaOculta ? "text" : "password";

    togglePassword.textContent =
      estaOculta ? "Ocultar" : "Mostrar";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username =
      form.elements.username.value.trim().toLowerCase();

    const password =
      form.elements.password.value;

    mostrarMensajeLogin("", "");

    if (!username || !password) {
      mostrarMensajeLogin(
        "Completa el usuario y la contraseña.",
        "error"
      );

      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Verificando...";

    try {
      const usernameSeguro =
        encodeURIComponent(username);

      /*
       * Se consulta únicamente por username.
       * La contraseña se compara después para evitar colocarla
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
          "Usuario o contraseña incorrectos.",
          "error"
        );

        return;
      }

      guardarSesion(usuario);
      mostrarDashboard();
    } catch (error) {
      console.error(
        "Error durante el inicio de sesión:",
        error
      );

      mostrarMensajeLogin(
        "No fue posible conectar con la API. Comprueba que JSON Server esté funcionando.",
        "error"
      );
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesión";
    }
  });
}

function mostrarMensajeLogin(texto, tipo) {
  const message =
    document.querySelector("#login-message");

  if (!message) {
    return;
  }

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
        "El usuario solo puede contener letras, números, puntos, guiones y guiones bajos.",
        "error"
      );

      return;
    }

    if (password.length < 6) {
      mostrarMensajeRegistro(
        "La contraseña debe tener al menos 6 caracteres.",
        "error"
      );

      return;
    }

    if (password !== confirmPassword) {
      mostrarMensajeRegistro(
        "Las contraseñas no coinciden.",
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
        `Usuario ${usuarioCreado.username} creado correctamente. Ya puedes iniciar sesión.`,
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
        "No fue posible crear el usuario. Comprueba que JSON Server esté funcionando.",
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

function mostrarDashboard() {
  const session = obtenerSesion();

  if (!session) {
    mostrarLogin();
    return;
  }

  const nombreSeguro =
    escaparHTML(session.nombre);

  const rolSeguro =
    escaparHTML(session.rol);

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
            <strong>${nombreSeguro}</strong>
            <span>${rolSeguro}</span>
          </div>

          <button
            id="logout-button"
            class="logout-button"
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div class="dashboard-layout">
        <aside class="sidebar">
          <nav aria-label="Módulos de JobConnect">
            <button
              class="module-button active"
              data-module="inicio"
            >
              Inicio
            </button>

            <button
              class="module-button"
              data-module="candidatos"
            >
              Candidatos
            </button>

            <button
              class="module-button"
              data-module="vacantes"
            >
              Vacantes
            </button>

            <button
              class="module-button"
              data-module="empresas"
            >
              Empresas
            </button>

            <button
              class="module-button"
              data-module="postulaciones"
            >
              Postulaciones
            </button>

            <button
              class="module-button"
              data-module="entrevistas"
            >
              Entrevistas
            </button>

            <button
              class="module-button"
              data-module="tareas"
            >
              Tareas
            </button>
          </nav>
        </aside>

        <main
          id="dashboard-content"
          class="dashboard-content"
        >
          <section class="welcome-card">
            <p class="eyebrow">Panel principal</p>

            <h1>Bienvenido, ${nombreSeguro}</h1>

            <p>
              Selecciona uno de los módulos del menú
              para comenzar a administrar JobConnect.
            </p>
          </section>

          <section class="module-grid">
            ${crearTarjeta(
              "Candidatos",
              "Administrar perfiles de candidatos"
            )}

            ${crearTarjeta(
              "Vacantes",
              "Gestionar oportunidades laborales"
            )}

            ${crearTarjeta(
              "Empresas",
              "Administrar empresas clientes"
            )}

            ${crearTarjeta(
              "Postulaciones",
              "Revisar procesos de aplicación"
            )}

            ${crearTarjeta(
              "Entrevistas",
              "Organizar entrevistas y notas"
            )}

            ${crearTarjeta(
              "Tareas",
              "Controlar tareas de reclutamiento"
            )}
          </section>
        </main>
      </div>
    </div>
  `;

  configurarDashboard();
}

function crearTarjeta(nombre, descripcion) {
  return `
    <article class="module-card">
      <h2>${escaparHTML(nombre)}</h2>
      <p>${escaparHTML(descripcion)}</p>
    </article>
  `;
}

function configurarDashboard() {
  const logoutButton =
    document.querySelector("#logout-button");

  const moduleButtons =
    document.querySelectorAll(".module-button");

  const dashboardContent =
    document.querySelector("#dashboard-content");

  logoutButton.addEventListener(
    "click",
    cerrarSesion
  );

  moduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moduleButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const moduleName =
        button.dataset.module;

      if (moduleName === "inicio") {
        mostrarDashboard();
        return;
      }

      const moduleNameSeguro =
        escaparHTML(capitalizar(moduleName));

      dashboardContent.innerHTML = `
        <section class="empty-module">
          <p class="eyebrow">Módulo</p>

          <h1>${moduleNameSeguro}</h1>

          <p>
            Este espacio está preparado para integrar
            el módulo de ${moduleNameSeguro}
            desarrollado por el equipo.
          </p>
        </section>
      `;
    });
  });
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

function iniciarAplicacion() {
  if (obtenerSesion()) {
    mostrarDashboard();
  } else {
    mostrarLogin();
  }
}

iniciarAplicacion();