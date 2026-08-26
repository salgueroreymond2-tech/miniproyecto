import "./style.css";
import { mostrarToast, confirmarAccion } from "./services/api.js";

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
    rol: usuario.rol || "Reclutadora",
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

function mostrarLogin(modo = "login") {
  const esLogin = modo === "login";

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
            <p>Sistema de empleabilidad</p>
          </div>
        </div>

        <div class="login-heading">
          <h2>${esLogin ? "Iniciar sesión" : "Registro de Postulante"}</h2>
          <p>${esLogin ? "Ingresa tus credenciales para acceder al panel." : "Crea tu cuenta de candidato para postularte a vacantes."}</p>
        </div>

        <!-- ── SELECTOR DE MODO (LOGIN / REGISTRO) ── -->
        <div class="auth-tabs" role="tablist">
          <button type="button" id="tab-login" class="auth-tab ${esLogin ? 'active' : ''}">Iniciar Sesión</button>
          <button type="button" id="tab-registro" class="auth-tab ${!esLogin ? 'active' : ''}">Crear Cuenta</button>
        </div>

        <!-- ── MENSAJE DE ESTADO ── -->
        <p id="auth-message" class="login-message" role="alert"></p>

        ${esLogin ? `
        <!-- ── FORMULARIO DE INICIO DE SESIÓN ── -->
        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="username">Usuario o Correo</label>
            <input id="username" name="username" type="text"
                   autocomplete="username" placeholder="Escribe tu usuario o correo" required>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-container">
              <input id="password" name="password" type="password"
                utocomplete="current-password" placeholder="Escribe tu contraseña" required>
              <button id="toggle-password" class="password-button" type="button"
                      aria-label="Mostrar contraseña">Mostrar</button>
            </div>
          </div>

          <button id="auth-submit-button" class="primary-button" type="submit" style="margin-top: 6px;">
            Iniciar sesión
          </button>

          <p class="auth-switch-text">
            ¿No tienes una cuenta? 
            <button type="button" id="switch-to-register" class="auth-switch-link">Regístrate como postulante</button>
          </p>
        </form>
        ` : `
        <!-- ── FORMULARIO DE REGISTRO DE POSTULANTE ── -->
        <form id="register-form" novalidate>
          <div class="form-group">
            <label for="reg-nombre">Nombre Completo *</label>
            <input id="reg-nombre" name="nombre" type="text"
                   placeholder="Ej. Juan Pérez" required>
          </div>

          <div class="form-group">
            <label for="reg-username">Nombre de Usuario *</label>
            <input id="reg-username" name="username" type="text"
                   autocomplete="username" placeholder="Ej. juanperez" required>
          </div>

          <div class="form-group">
            <label for="reg-email">Correo Electrónico *</label>
            <input id="reg-email" name="email" type="email"
                   autocomplete="email" placeholder="Ej. juan@correo.com" required>
          </div>

          <div class="form-group">
            <label for="reg-telefono">Teléfono</label>
            <input id="reg-telefono" name="telefono" type="tel"
                   placeholder="Ej. +506 8888-8888">
          </div>

          <div class="form-group">
            <label for="reg-profesion">Profesión / Puesto Deseado *</label>
            <input id="reg-profesion" name="profesion" type="text"
                   placeholder="Ej. Desarrollador Web, Diseñador UX" required>
          </div>

          <div class="form-group">
            <label for="reg-password">Contraseña *</label>
            <div class="password-container">
              <input id="reg-password" name="password" type="password"
                     autocomplete="new-password" placeholder="Mínimo 6 caracteres" required>
              <button id="toggle-reg-password" class="password-button" type="button"
                      aria-label="Mostrar contraseña">Mostrar</button>
            </div>
          </div>

          <button id="auth-submit-button" class="primary-button" type="submit" style="margin-top: 6px;">
            Registrarme como Postulante
          </button>

          <p class="auth-switch-text">
            ¿Ya tienes una cuenta? 
            <button type="button" id="switch-to-login" class="auth-switch-link">Inicia sesión aquí</button>
          </p>
        </form>
        `}
      </section>
    </main>
  `;

  configurarAuth(modo);
}

function configurarAuth(modo) {
  const tabLogin = document.querySelector("#tab-login");
  const tabRegistro = document.querySelector("#tab-registro");
  const switchRegister = document.querySelector("#switch-to-register");
  const switchLogin = document.querySelector("#switch-to-login");
  const message = document.querySelector("#auth-message");
  const submitButton = document.querySelector("#auth-submit-button");

  if (tabLogin) tabLogin.addEventListener("click", () => mostrarLogin("login"));
  if (tabRegistro) tabRegistro.addEventListener("click", () => mostrarLogin("registro"));
  if (switchRegister) switchRegister.addEventListener("click", () => mostrarLogin("registro"));
  if (switchLogin) switchLogin.addEventListener("click", () => mostrarLogin("login"));

  // Toggle visibilidad de contraseña
  const togglePassword = document.querySelector("#toggle-password") || document.querySelector("#toggle-reg-password");
  const passwordInput = document.querySelector("#password") || document.querySelector("#reg-password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const oculta = passwordInput.type === "password";
      passwordInput.type = oculta ? "text" : "password";
      togglePassword.textContent = oculta ? "Ocultar" : "Mostrar";
    });
  }

  // Manejo de Login
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const usernameInput = loginForm.username.value.trim();
      const password = loginForm.password.value;

      message.textContent = "";
      message.className = "login-message";

      if (!usernameInput || !password) {
        message.textContent = "Por favor, completa el usuario y la contraseña.";
        message.classList.add("error");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Verificando...";

      try {
        const response = await fetch(`${API_URL}/usuarios`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const usuarios = await response.json();
        const usuarioEncontrado = usuarios.find(
          u => (u.username?.toLowerCase() === usernameInput.toLowerCase() || u.email?.toLowerCase() === usernameInput.toLowerCase()) && u.password === password
        );

        if (!usuarioEncontrado) {
          message.textContent = "Usuario o contraseña incorrectos.";
          message.classList.add("error");
          return;
        }

        guardarSesion(usuarioEncontrado);
        mostrarDashboard();
      } catch (error) {
        console.error(error);
        message.textContent = "No fue posible conectar con el servidor. Verifica que JSON Server esté activo en http://localhost:3000.";
        message.classList.add("error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Iniciar sesión";
      }
    });
  }

  // Manejo de Registro
  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nombre = registerForm.nombre.value.trim();
      const username = registerForm.username.value.trim();
      const email = registerForm.email.value.trim();
      const telefono = registerForm.telefono.value.trim();
      const profesion = registerForm.profesion.value.trim();
      const password = registerForm.password.value;

      message.textContent = "";
      message.className = "login-message";

      if (!nombre || !username || !email || !profesion || !password) {
        message.textContent = "Por favor completa todos los campos obligatorios (*).";
        message.classList.add("error");
        return;
      }

      if (password.length < 6) {
        message.textContent = "La contraseña debe tener al menos 6 caracteres.";
        message.classList.add("error");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Registrando...";

      try {
        // Verificar si ya existe usuario o email
        const resUsuarios = await fetch(`${API_URL}/usuarios`);
        if (!resUsuarios.ok) throw new Error("Error al consultar usuarios existentes.");
        const usuarios = await resUsuarios.json();

        const yaExiste = usuarios.some(
          u => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase()
        );

        if (yaExiste) {
          message.textContent = "El nombre de usuario o correo electrónico ya se encuentra registrado.";
          message.classList.add("error");
          submitButton.disabled = false;
          submitButton.textContent = "Registrarme como Postulante";
          return;
        }

        // Crear registro en usuarios
        const nuevoId = String(Date.now());
        const nuevoUsuario = {
          id: nuevoId,
          username,
          password,
          nombre,
          email,
          telefono,
          profesion,
          rol: "Postulante"
        };

        const resCrearUser = await fetch(`${API_URL}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario)
        });

        if (!resCrearUser.ok) throw new Error("No se pudo crear el usuario en el servidor.");

        // Registrar también en candidatos para que aparezca en el pool de talento
        await fetch(`${API_URL}/candidatos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: nuevoId,
            nombre,
            email,
            telefono,
            profesion
          })
        }).catch(err => console.warn("Aviso al crear candidato:", err));

        // Iniciar sesión automáticamente
        guardarSesion(nuevoUsuario);
        mostrarDashboard();
      } catch (error) {
        console.error(error);
        message.textContent = "Error al registrar la cuenta. Asegúrate de que JSON Server esté activo.";
        message.classList.add("error");
        submitButton.disabled = false;
        submitButton.textContent = "Registrarme como Postulante";
      }
    });
  }
}

function mostrarMensajeLogin(texto, tipo) {
  const message =
    document.querySelector("#login-message");

async function mostrarDashboard() {
  const session = obtenerSesion();
  if (!session) { mostrarLogin(); return; }

  if (session.rol === "Postulante") {
    await mostrarPortalPostulante("inicio");
    return;
  }

  await mostrarDashboardAdmin();
}

/* ═══════════════════════════════════════════════
   PORTAL DEL POSTULANTE / CANDIDATO
   ═══════════════════════════════════════════════ */

async function mostrarPortalPostulante(vistaActiva = "inicio") {
  const session = obtenerSesion();
  if (!session) { mostrarLogin(); return; }

  const iniciales = getIniciales(session.nombre);

  // Cargar datos del postulante y ofertas
  let vacantes = [];
  let postulaciones = [];
  let entrevistas = [];
  let candidatos = [];

  try {
    const [resVac, resPost, resEnt, resCand] = await Promise.allSettled([
      fetch(`${API_URL}/vacantes`).then(r => r.json()),
      fetch(`${API_URL}/postulaciones`).then(r => r.json()),
      fetch(`${API_URL}/entrevistas`).then(r => r.json()),
      fetch(`${API_URL}/candidatos`).then(r => r.json())
    ]);

    vacantes = resVac.status === "fulfilled" && Array.isArray(resVac.value) ? resVac.value : [];
    postulaciones = resPost.status === "fulfilled" && Array.isArray(resPost.value) ? resPost.value : [];
    entrevistas = resEnt.status === "fulfilled" && Array.isArray(resEnt.value) ? resEnt.value : [];
    candidatos = resCand.status === "fulfilled" && Array.isArray(resCand.value) ? resCand.value : [];
  } catch (error) {
    console.error("Error al cargar datos del postulante:", error);
  }

  // Encontrar el registro del candidato
  let miCandidato = candidatos.find(
    c => (c.email && c.email.toLowerCase() === session.email?.toLowerCase()) || String(c.id) === String(session.id)
  );

  if (!miCandidato) {
    miCandidato = {
      id: session.id,
      nombre: session.nombre,
      email: session.email || `${session.username}@jobconnect.com`,
      telefono: session.telefono || "+506 8888-0000",
      profesion: session.profesion || "Profesional"
    };
  }

  // Filtrar mis postulaciones
  const misPostulaciones = postulaciones.filter(
    p => String(p.candidatoId) === String(miCandidato.id) || String(p.candidatoId) === String(session.id)
  );

  // Contar entrevistas agendadas
  const misEntrevistas = entrevistas.filter(
    e => misPostulaciones.some(p => String(p.id) === String(e.postulacionId)) || String(e.candidatoId) === String(miCandidato.id)
  );

  // CV en memoria/localStorage
  const cvGuardado = localStorage.getItem(`jobconnect_cv_${session.id}`) || "Curriculum_Vitae_Actualizado.pdf";

  // Renderizar contenido según la vista activa
  let contenidoPrincipal = "";

  if (vistaActiva === "inicio") {
    contenidoPrincipal = `
      <section class="welcome-card">
        <p class="eyebrow">Portal de Empleabilidad del Candidato</p>
        <h1>¡Hola, ${session.nombre}! 👋</h1>
        <p>Explora ofertas laborales recomendadas para tu perfil, postúlate con un solo clic y dale seguimiento a tus entrevistas en tiempo real.</p>
      </section>

      <!-- ── STATS DEL POSTULANTE ── -->
      <section class="stats-overview">
        <div class="stat-card" role="button" data-nav="vacantes" style="cursor: pointer;">
          <div class="stat-icon-wrapper" style="color: #565DFF; background: rgba(86, 93, 255, 0.15);">
            <span class="material-symbols-rounded" style="font-size: 24px;">work</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">${vacantes.length}</span>
            <span class="stat-label">Vacantes Disponibles</span>
          </div>
        </div>

        <div class="stat-card" role="button" data-nav="mis-postulaciones" style="cursor: pointer;">
          <div class="stat-icon-wrapper" style="color: #F59E0B; background: rgba(245, 158, 11, 0.15);">
            <span class="material-symbols-rounded" style="font-size: 24px;">description</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">${misPostulaciones.length}</span>
            <span class="stat-label">Mis Postulaciones</span>
          </div>
        </div>

        <div class="stat-card" role="button" data-nav="mis-postulaciones" style="cursor: pointer;">
          <div class="stat-icon-wrapper" style="color: #EC4899; background: rgba(236, 72, 153, 0.15);">
            <span class="material-symbols-rounded" style="font-size: 24px;">calendar_month</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">${misEntrevistas.length}</span>
            <span class="stat-label">Entrevistas Agendadas</span>
          </div>
        </div>

        <div class="stat-card" role="button" data-nav="perfil" style="cursor: pointer;">
          <div class="stat-icon-wrapper" style="color: #10B981; background: rgba(16, 185, 129, 0.15);">
            <span class="material-symbols-rounded" style="font-size: 24px;">badge</span>
          </div>
          <div class="stat-info">
            <span class="stat-value" style="font-size: 16px; color: #10B981;">Perfil Activo</span>
            <span class="stat-label">CV: ${cvGuardado ? 'Cargado' : 'Pendiente'}</span>
          </div>
        </div>
      </section>

      <!-- ── VACANTES DESTACADAS ── -->
      <div class="section-title-row" style="margin-top: 28px;">
        <div>
          <h2>Vacantes Recientes</h2>
          <p>Oportunidades laborales abiertas recientemente</p>
        </div>
        <button class="btn btn-secondary" data-nav="vacantes" style="font-size: 13px;">Ver todas &rarr;</button>
      </div>

      <div class="candidate-jobs-grid">
        ${vacantes.slice(0, 3).map(v => renderTarjetaVacanteCandidato(v, misPostulaciones)).join("")}
      </div>

      <!-- ── CONSEJOS PARA EL POSTULANTE ── -->
      <section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; margin-top: 32px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span class="material-symbols-rounded" style="color: var(--accent); font-size: 24px;">tips_and_updates</span>
          <h3 style="font-size: 18px; color: white;">Consejos para impulsar tu postulación</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
          <div style="background: var(--bg-raised); padding: 14px; border-radius: 8px; border: 1px solid var(--border-light);">
            <strong style="color: white; display: block; margin-bottom: 4px;">1. Mantén tu CV al día</strong>
            Sube tu currículum en formato PDF en la sección <em>Mi Perfil & CV</em> con tus últimas tecnologías y proyectos.
          </div>
          <div style="background: var(--bg-raised); padding: 14px; border-radius: 8px; border: 1px solid var(--border-light);">
            <strong style="color: white; display: block; margin-bottom: 4px;">2. Revisa tus requisitos</strong>
            Asegúrate de que tus habilidades coincidan con las tecnologías requeridas por la empresa antes de postularte.
          </div>
          <div style="background: var(--bg-raised); padding: 14px; border-radius: 8px; border: 1px solid var(--border-light);">
            <strong style="color: white; display: block; margin-bottom: 4px;">3. Monitorea tus estados</strong>
            En <em>Mis Postulaciones</em> podrás ver si tu perfil avanzó a etapa de entrevista o fue seleccionado.
          </div>
        </div>
      </section>
    `;
  } else if (vistaActiva === "vacantes") {
    contenidoPrincipal = `
      <section class="welcome-card">
        <p class="eyebrow">Ofertas Laborales</p>
        <h1>Vacantes Disponibles</h1>
        <p>Explora todas las oportunidades de trabajo publicadas por nuestras empresas clientes y postúlate en un clic.</p>
      </section>

      <div class="candidate-search-bar" style="margin-bottom: 24px;">
        <span class="material-symbols-rounded" style="color: var(--text-muted);">search</span>
        <input type="text" id="input-buscar-vacantes" placeholder="Buscar por puesto, empresa, ubicación o tecnología (ej: React, Python, San José)..." />
      </div>

      <div id="contenedor-vacantes-postulante" class="candidate-jobs-grid">
        ${vacantes.length === 0 ? '<p class="empty-message">No hay vacantes disponibles en este momento.</p>' : vacantes.map(v => renderTarjetaVacanteCandidato(v, misPostulaciones)).join("")}
      </div>
    `;
  } else if (vistaActiva === "mis-postulaciones") {
    contenidoPrincipal = `
      <section class="welcome-card">
        <p class="eyebrow">Seguimiento de Candidatura</p>
        <h1>Mis Postulaciones</h1>
        <p>Revisa el estado de cada proceso de selección en el que estás participando y los detalles de tus entrevistas.</p>
      </section>

      <div class="applications-list">
        ${misPostulaciones.length === 0 ? `
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 48px 24px; text-align: center;">
            <span class="material-symbols-rounded" style="font-size: 48px; color: var(--text-muted); margin-bottom: 12px;">work_outline</span>
            <h3 style="color: white; font-size: 18px; margin-bottom: 6px;">Aún no te has postulado a ninguna vacante</h3>
            <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px;">Explora el listado de ofertas disponibles y aplica a las que coincidan con tu experiencia.</p>
            <button class="btn btn-primary" data-nav="vacantes">Ver Vacantes Disponibles</button>
          </div>
        ` : misPostulaciones.map(post => {
          const vacante = vacantes.find(v => String(v.id) === String(post.vacanteId));
          const entrevistaAsociada = entrevistas.find(e => String(e.postulacionId) === String(post.id));

          let estadoColor = "#F59E0B";
          let estadoBg = "rgba(245, 158, 11, 0.15)";
          if (post.estado === "Seleccionado") { estadoColor = "#10B981"; estadoBg = "rgba(16, 185, 129, 0.15)"; }
          else if (post.estado === "Entrevista") { estadoColor = "#EC4899"; estadoBg = "rgba(236, 72, 153, 0.15)"; }
          else if (post.estado === "Rechazado") { estadoColor = "#EF4444"; estadoBg = "rgba(239, 68, 68, 0.15)"; }

          return `
            <article class="application-item-card">
              <div class="application-item-header">
                <div>
                  <h3 style="font-size: 18px; color: white; margin-bottom: 4px;">${vacante?.titulo || "Puesto Profesional"}</h3>
                  <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-secondary);">
                    <span><strong>Empresa:</strong> ${vacante?.empresa || "Empresa Confidencial"}</span>
                    <span>•</span>
                    <span><strong>Ubicación:</strong> ${vacante?.ubicacion || "Remoto"}</span>
                    <span>•</span>
                    <span><strong>Fecha de Aplicación:</strong> ${post.fecha}</span>
                  </div>
                </div>
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; color: ${estadoColor}; background: ${estadoBg}; border: 1px solid ${estadoColor}40;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${estadoColor};"></span>
                  ${post.estado}
                </span>
              </div>

              ${entrevistaAsociada ? `
                <div class="interview-banner">
                  <span class="material-symbols-rounded" style="font-size: 24px; flex-shrink: 0;">event_available</span>
                  <div>
                    <strong style="display: block; font-size: 14px; margin-bottom: 2px;">¡Entrevista Programada!</strong>
                    <div style="font-size: 13px;">
                      <strong>Fecha y Hora:</strong> ${entrevistaAsociada.fecha} a las ${entrevistaAsociada.hora} hs.
                    </div>
                    ${entrevistaAsociada.notas ? `<p style="font-size: 12px; margin-top: 4px; opacity: 0.9;"><strong>Indicaciones:</strong> ${entrevistaAsociada.notas}</p>` : ''}
                  </div>
                </div>
              ` : ''}
            </article>
          `;
        }).join("")}
      </div>
    `;
  } else if (vistaActiva === "perfil") {
    contenidoPrincipal = `
      <section class="welcome-card">
        <p class="eyebrow">Información Personal y Profesional</p>
        <h1>Mi Perfil & Curriculum Vitae</h1>
        <p>Mantén tus datos de contacto al día y sube tu CV para que los reclutadores puedan evaluar tu experiencia.</p>
      </section>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        <!-- ── FORMULARIO DE EDICIÓN DE PERFIL ── -->
        <section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px;">
          <h3 style="font-size: 18px; color: white; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-rounded" style="color: var(--accent);">person</span>
            Datos del Candidato
          </h3>

          <div id="perfil-message" class="login-message" style="margin-bottom: 16px;"></div>

          <form id="form-editar-perfil" novalidate style="display: grid; gap: 16px;">
            <div class="form-group">
              <label for="perf-nombre">Nombre Completo *</label>
              <input type="text" id="perf-nombre" name="nombre" value="${session.nombre || ''}" required />
            </div>

            <div class="form-group">
              <label for="perf-email">Correo Electrónico *</label>
              <input type="email" id="perf-email" name="email" value="${session.email || miCandidato.email || ''}" required />
            </div>

            <div class="form-group">
              <label for="perf-telefono">Teléfono</label>
              <input type="tel" id="perf-telefono" name="telefono" value="${session.telefono || miCandidato.telefono || ''}" />
            </div>

            <div class="form-group">
              <label for="perf-profesion">Profesión / Puesto Deseado *</label>
              <input type="text" id="perf-profesion" name="profesion" value="${session.profesion || miCandidato.profesion || ''}" required />
            </div>

            <div class="form-group">
              <label for="perf-resumen">Resumen Profesional / Carta de Presentación</label>
              <textarea id="perf-resumen" name="resumen" rows="3" placeholder="Describe brevemente tus habilidades, años de experiencia y objetivos laborales...">${session.resumen || ''}</textarea>
            </div>

            <button type="submit" id="btn-guardar-perfil" class="btn btn-primary" style="margin-top: 8px; justify-content: center;">
              Guardar Cambios de Perfil
            </button>
          </form>
        </section>

        <!-- ── SUBIDA DE CV ── -->
        <section class="cv-upload-card">
          <h3 style="font-size: 18px; color: white; display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-rounded" style="color: #10B981;">upload_file</span>
            Curriculum Vitae
          </h3>
          <p style="color: var(--text-secondary); font-size: 13px;">Sube tu CV en formato PDF o Word (máximo 10MB) para que se adjunte automáticamente a tus postulaciones.</p>

          <div id="cv-upload-message" class="login-message"></div>

          <div class="cv-dropzone" id="cv-dropzone-box">
            <span class="material-symbols-rounded" style="font-size: 44px; color: var(--accent); margin-bottom: 8px;">cloud_upload</span>
            <strong style="color: white; display: block; margin-bottom: 4px;">Haz clic aquí para seleccionar tu CV</strong>
            <span style="font-size: 12px; color: var(--text-muted);">Formatos admitidos: PDF, DOCX, DOC</span>
            <input type="file" id="input-file-cv" accept=".pdf,.doc,.docx" style="display: none;" />
          </div>

          <div class="cv-current-file">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="material-symbols-rounded" style="font-size: 28px; color: #EF4444;">picture_as_pdf</span>
              <div>
                <strong id="cv-filename-display" style="font-size: 14px; color: white; display: block;">${cvGuardado}</strong>
                <span style="font-size: 12px; color: var(--text-muted);">CV Principal Adjunto</span>
              </div>
            </div>
            <button type="button" id="btn-descargar-cv" class="btn btn-secondary" style="font-size: 12px; padding: 6px 12px;">
              <span class="material-symbols-rounded" style="font-size: 16px;">download</span>
              Descargar
            </button>
          </div>
        </section>
      </div>
    `;
  }

  // Renderizar plantilla global del postulante
  app.innerHTML = `
    <div class="dashboard">
      <!-- ── NAVBAR DEL POSTULANTE ── -->
      <header class="jc-navbar">
        <div class="jc-navbar-brand">
          <div class="jc-navbar-logo">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span class="jc-navbar-name">JobConnect</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right; display: grid; gap: 1px;">
            <strong style="font-size: 14px; font-weight: 600; color: #F0F0F0;">${session.nombre}</strong>
            <span style="font-size: 12px; color: #10B981; font-weight: 600;">Postulante</span>
          </div>
          <div class="jc-navbar-avatar" style="background: linear-gradient(135deg, #10B981, #059669);">${iniciales}</div>
          <button id="logout-button" class="logout-button" type="button" title="Cerrar sesión">Salir</button>
        </div>
      </header>

      <!-- ── LAYOUT CON SIDEBAR DEL POSTULANTE ── -->
      <div class="dashboard-layout">
        <aside class="sidebar">
          <div>
            <div class="sidebar-section-title">Portal del Candidato</div>
            <nav aria-label="Módulos del Postulante">
              <button class="module-button ${vistaActiva === 'inicio' ? 'active' : ''}" data-nav="inicio">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">home</span>
                  <span>Inicio</span>
                </div>
              </button>

              <button class="module-button ${vistaActiva === 'vacantes' ? 'active' : ''}" data-nav="vacantes">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">work</span>
                  <span>Vacantes Disponibles</span>
                </div>
                <span class="module-badge-count">${vacantes.length}</span>
              </button>

              <button class="module-button ${vistaActiva === 'mis-postulaciones' ? 'active' : ''}" data-nav="mis-postulaciones">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">description</span>
                  <span>Mis Postulaciones</span>
                </div>
                <span class="module-badge-count">${misPostulaciones.length}</span>
              </button>

              <button class="module-button ${vistaActiva === 'perfil' ? 'active' : ''}" data-nav="perfil">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">badge</span>
                  <span>Mi Perfil & CV</span>
                </div>
              </button>
            </nav>
          </div>

          <div class="sidebar-bottom-info">
            <div class="sidebar-status-pill">
              <span class="status-dot-online"></span>
              <span>Candidato Conectado</span>
            </div>
          </div>
        </aside>

        <!-- ── CONTENIDO PRINCIPAL ── -->
        <main id="dashboard-content" class="dashboard-content">
          ${contenidoPrincipal}
        </main>
      </div>

      <!-- ── FOOTER ── -->
      <footer class="jc-footer">
        <span>&copy; 2026 JobConnect — Portal de Candidatos</span>
        <span>Conectando talento profesional</span>
      </footer>
    </div>
  `;

  configurarEventosPostulante(vistaActiva, vacantes, misPostulaciones, miCandidato, session);
}

function renderTarjetaVacanteCandidato(vacante, misPostulaciones) {
  const yaPostulado = misPostulaciones.some(p => String(p.vacanteId) === String(vacante.id));

  return `
    <article class="candidate-job-card" data-vacante-id="${vacante.id}">
      <div>
        <div class="job-card-header">
          <div>
            <h3 class="job-title">${vacante.titulo}</h3>
            <span class="job-company">
              <span class="material-symbols-rounded" style="font-size: 16px;">domain</span>
              ${vacante.empresa || "Empresa"}
            </span>
          </div>
          <span class="status-badge" style="font-size: 11px;">${vacante.estado || "Abierta"}</span>
        </div>

        <p class="job-desc" style="margin: 12px 0;">${vacante.descripcion}</p>

        <div class="job-meta-row" style="margin-bottom: 12px;">
          <div class="job-meta-item">
            <span class="material-symbols-rounded" style="font-size: 16px; color: #10B981;">payments</span>
            <span>${vacante.salario || "A convenir"}</span>
          </div>
          <div class="job-meta-item">
            <span class="material-symbols-rounded" style="font-size: 16px; color: #38BDF8;">location_on</span>
            <span>${vacante.ubicacion || "San José"}</span>
          </div>
        </div>

        ${vacante.requisitos ? `
          <div class="job-requirements-box">
            <strong>Requisitos / Tecnologías:</strong>
            <span>${vacante.requisitos}</span>
          </div>
        ` : ''}
      </div>

      <div style="margin-top: 16px;">
        ${yaPostulado ? `
          <span class="applied-badge">
            <span class="material-symbols-rounded" style="font-size: 18px;">check_circle</span>
            Ya te has postulado
          </span>
        ` : `
          <button type="button" class="btn btn-primary btn-postularme" data-id="${vacante.id}" style="width: 100%; justify-content: center;">
            <span class="material-symbols-rounded">send</span>
            Postularme ahora
          </button>
        `}
      </div>
    </article>
  `;
}

function configurarEventosPostulante(vistaActiva, vacantes, misPostulaciones, miCandidato, session) {
  // Navegación entre pestañas
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const destino = btn.dataset.nav;
      if (destino) mostrarPortalPostulante(destino);
    });
  });

  // Logout
  const logoutBtn = document.querySelector("#logout-button");
  if (logoutBtn) logoutBtn.addEventListener("click", cerrarSesion);

  // Buscador de vacantes en tiempo real
  const inputBuscar = document.querySelector("#input-buscar-vacantes");
  const contenedorVacantes = document.querySelector("#contenedor-vacantes-postulante");

  if (inputBuscar && contenedorVacantes) {
    inputBuscar.addEventListener("input", (e) => {
      const termino = e.target.value.toLowerCase().trim();
      const filtradas = vacantes.filter(v => 
        (v.titulo && v.titulo.toLowerCase().includes(termino)) ||
        (v.empresa && v.empresa.toLowerCase().includes(termino)) ||
        (v.ubicacion && v.ubicacion.toLowerCase().includes(termino)) ||
        (v.requisitos && v.requisitos.toLowerCase().includes(termino)) ||
        (v.descripcion && v.descripcion.toLowerCase().includes(termino))
      );

      contenedorVacantes.innerHTML = filtradas.length === 0 
        ? '<p class="empty-message">No se encontraron vacantes con ese criterio de búsqueda.</p>'
        : filtradas.map(v => renderTarjetaVacanteCandidato(v, misPostulaciones)).join("");

      asignarEventosPostulacion(contenedorVacantes, miCandidato, session);
    });
  }

  // Asignar clics de postulación en las tarjetas
  asignarEventosPostulacion(document, miCandidato, session);

  // Eventos de Perfil y CV
  if (vistaActiva === "perfil") {
    const formPerfil = document.querySelector("#form-editar-perfil");
    const perfilMsg = document.querySelector("#perfil-message");

    if (formPerfil) {
      formPerfil.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = formPerfil.nombre.value.trim();
        const email = formPerfil.email.value.trim();
        const telefono = formPerfil.telefono.value.trim();
        const profesion = formPerfil.profesion.value.trim();
        const resumen = formPerfil.resumen.value.trim();

        if (!nombre || !email || !profesion) {
          perfilMsg.textContent = "Por favor completa los campos obligatorios (*).";
          perfilMsg.className = "login-message error";
          return;
        }

        try {
          const usuarioActualizado = {
            ...session,
            nombre,
            email,
            telefono,
            profesion,
            resumen
          };

          // Actualizar en /usuarios
          await fetch(`${API_URL}/usuarios/${session.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, telefono, profesion, resumen })
          }).catch(() => null);

          // Actualizar en /candidatos si existe
          if (miCandidato && miCandidato.id) {
            await fetch(`${API_URL}/candidatos/${miCandidato.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nombre, email, telefono, profesion })
            }).catch(() => null);
          }

          guardarSesion(usuarioActualizado);
          perfilMsg.textContent = "¡Perfil actualizado exitosamente!";
          perfilMsg.className = "login-message success";
        } catch (error) {
          console.error(error);
          perfilMsg.textContent = "Error al actualizar el perfil.";
          perfilMsg.className = "login-message error";
        }
      });
    }

    // Subida interactiva de CV
    const dropzone = document.querySelector("#cv-dropzone-box");
    const inputFile = document.querySelector("#input-file-cv");
    const cvDisplay = document.querySelector("#cv-filename-display");
    const cvMsg = document.querySelector("#cv-upload-message");
    const btnDescargar = document.querySelector("#btn-descargar-cv");

    if (dropzone && inputFile) {
      dropzone.addEventListener("click", () => inputFile.click());

      inputFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          localStorage.setItem(`jobconnect_cv_${session.id}`, file.name);
          if (cvDisplay) cvDisplay.textContent = file.name;
          if (cvMsg) {
            cvMsg.textContent = `¡Archivo "${file.name}" cargado exitosamente!`;
            cvMsg.className = "login-message success";
          }
        }
      });
    }

    if (btnDescargar) {
      btnDescargar.addEventListener("click", () => {
        mostrarToast(`Descargando "${cvDisplay?.textContent || 'Curriculum.pdf'}"...`, "info");
      });
    }
  }
}

function asignarEventosPostulacion(contenedor, miCandidato, session) {
  contenedor.querySelectorAll(".btn-postularme").forEach(btn => {
    btn.addEventListener("click", async () => {
      const vacanteId = btn.dataset.id;
      if (!vacanteId) return;

      btn.disabled = true;
      btn.innerHTML = `<span>Postulando...</span>`;

      try {
        const nuevaPostulacion = {
          id: String(Date.now()),
          candidatoId: String(miCandidato.id || session.id),
          vacanteId: String(vacanteId),
          fecha: new Date().toISOString().split("T")[0],
          estado: "En revisión"
        };

        const res = await fetch(`${API_URL}/postulaciones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevaPostulacion)
        });

        if (!res.ok) throw new Error("Error en la respuesta del servidor");

        mostrarToast("¡Te has postulado exitosamente a esta vacante!", "success");
        mostrarPortalPostulante("mis-postulaciones");
      } catch (error) {
        console.error(error);
        mostrarToast("No se pudo registrar la postulación. Intenta nuevamente.", "error");
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-rounded">send</span> Postularme ahora`;
      }
    });
  });
}

/* ═══════════════════════════════════════════════
   DASHBOARD DEL ADMINISTRADOR / RECLUTADOR
   ═══════════════════════════════════════════════ */

async function cargarMetricas() {
  const defaults = {
    vacantes: 0,
    empresas: 0,
    postulaciones: 0,
    entrevistas: 0,
    tareas: 0
  };

  message.textContent = texto;
  message.className = "login-message";

  if (tipo) {
    message.classList.add(tipo);
  }
}

async function mostrarDashboardAdmin() {
  const session = obtenerSesion();
  if (!session) { mostrarLogin(); return; }

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

      <!-- ── NAVBAR ── -->
      <header class="jc-navbar">
        <div class="jc-navbar-brand">
          <div class="jc-navbar-logo">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span class="jc-navbar-name">JobConnect</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right; display: grid; gap: 1px;">
            <strong style="font-size: 14px; font-weight: 600; color: #F0F0F0;">${session.nombre}</strong>
            <span style="font-size: 12px; color: #606474;">${session.rol}</span>
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

      <!-- ── LAYOUT ── -->
      <div class="dashboard-layout">
        <!-- ── SIDEBAR FIJO ── -->
        <aside class="sidebar">
          <nav aria-label="Módulos de JobConnect">
            <button
              class="module-button active"
              data-module="inicio"
            >
              Inicio
            </button>

              <a href="/vacantes/vacantes.html" class="module-button" data-module="vacantes">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">work</span>
                  <span>Vacantes</span>
                </div>
                <span class="module-badge-count">${metricas.vacantes}</span>
              </a>

              <a href="/empresas/empresas.html" class="module-button" data-module="empresas">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">domain</span>
                  <span>Empresas</span>
                </div>
                <span class="module-badge-count">${metricas.empresas}</span>
              </a>

              <a href="/postulaciones/postulaciones.html" class="module-button" data-module="postulaciones">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">description</span>
                  <span>Postulaciones</span>
                </div>
                <span class="module-badge-count">${metricas.postulaciones}</span>
              </a>

              <a href="/entrevistas/entrevistas.html" class="module-button" data-module="entrevistas">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">calendar_month</span>
                  <span>Entrevistas</span>
                </div>
                <span class="module-badge-count">${metricas.entrevistas}</span>
              </a>

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

          <div class="section-title-row">
            <div>
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
  obtenerSesion() ? mostrarDashboard() : mostrarLogin();
}

iniciarAplicacion();
