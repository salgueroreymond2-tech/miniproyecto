import {
  obtenerEmpresas,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresaPorId,
} from './empresasService.js';

const MENSAJE_CONFIRMAR_ELIMINAR = '¿Estás seguro de eliminar esta empresa?';
const MENSAJE_EXITO_CREAR = 'Empresa creada exitosamente';
const MENSAJE_EXITO_ACTUALIZAR = 'Empresa actualizada exitosamente';
const MENSAJE_EXITO_ELIMINAR = 'Empresa eliminada correctamente';

const MIN_CARACTERES_NOMBRE = 2;
const MAX_CARACTERES_NOMBRE = 100;
const MAX_CARACTERES_INDUSTRIA = 80;
const MAX_CARACTERES_CONTACTO = 100;
const MAX_CARACTERES_TELEFONO = 25;
const MAX_CARACTERES_EMAIL = 100;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let appContainer = null;
let empresasCache = [];

function mostrarMensaje(messageContainer, message, isError = false) {
  if (!messageContainer) return;
  const tipoClase = isError ? 'message error' : 'message success';
  messageContainer.innerHTML = `<div class="${tipoClase}">${message}</div>`;
}

function construirFilaEmpresa(empresa) {
  const id = empresa.id ?? '';
  const nombre = empresa.nombre || empresa.name || 'Sin nombre';
  const industria = empresa.industria || empresa.industry || 'N/A';
  const contacto = empresa.contacto || empresa.contact || 'N/A';
  const telefono = empresa.telefono || empresa.phone || 'N/A';
  const email = empresa.email || empresa.correo || 'N/A';

  return `
    <tr data-id="${id}">
      <td>${nombre}</td>
      <td>${industria}</td>
      <td>${contacto}</td>
      <td>${telefono}</td>
      <td>${email}</td>
      <td class="table-actions">
        <button type="button" class="btn btn-edit" data-action="edit" data-id="${id}">
          Editar
        </button>
        <button type="button" class="btn btn-delete" data-action="delete" data-id="${id}">
          Eliminar
        </button>
      </td>
    </tr>
  `;
}

function construirTablaEmpresas(empresas) {
  if (!Array.isArray(empresas) || empresas.length === 0) {
    return '<p class="empty-message">No hay empresas registradas en este momento.</p>';
  }

  const filasHtml = empresas.map(construirFilaEmpresa).join('');

  return `
    <table class="empresas-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Industria</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${filasHtml}
      </tbody>
    </table>
  `;
}

async function recargarListaEmpresas(contentContainer, messagesContainer) {
  try {
    const empresas = await obtenerEmpresas();
    empresasCache = Array.isArray(empresas) ? empresas : [];
    contentContainer.innerHTML = construirTablaEmpresas(empresasCache);
  } catch (error) {
    empresasCache = [];
    contentContainer.innerHTML = '';
    mostrarMensaje(
      messagesContainer,
      `Error al cargar las empresas: ${error.message}`,
      true
    );
  }
}

async function eliminarEmpresa(id, messagesContainer, contentContainer) {
  if (!id) return;

  const confirmacionUsuario = window.confirm(MENSAJE_CONFIRMAR_ELIMINAR);
  if (!confirmacionUsuario) return;

  try {
    await eliminarEmpresaPorId(id);
    await recargarListaEmpresas(contentContainer, messagesContainer);
    mostrarMensaje(messagesContainer, MENSAJE_EXITO_ELIMINAR);
  } catch (error) {
    mostrarMensaje(
      messagesContainer,
      `Error al eliminar la empresa: ${error.message}`,
      true
    );
  }
}

function construirFormularioEmpresa(empresa = null) {
  const esEdicion = Boolean(empresa && empresa.id);
  const tituloVista = esEdicion ? 'Editar Empresa' : 'Nueva Empresa';
  const textoBotonSubmit = esEdicion ? 'Guardar Cambios' : 'Crear Empresa';

  const nombre = empresa?.nombre || empresa?.name || '';
  const industria = empresa?.industria || empresa?.industry || '';
  const contacto = empresa?.contacto || empresa?.contact || '';
  const telefono = empresa?.telefono || empresa?.phone || '';
  const email = empresa?.email || empresa?.correo || '';

  return `
    <section class="empresas-form-section">
      <header class="form-header">
        <h2 class="form-title">${tituloVista}</h2>
      </header>
      <div id="form-messages" class="form-messages" aria-live="polite"></div>
      <form id="form-empresa" class="form-empresa" novalidate>
        <div class="form-group">
          <label for="campo-nombre">Nombre de la Empresa *</label>
          <input
            type="text"
            id="campo-nombre"
            name="nombre"
            value="${nombre}"
            placeholder="Ej. Tech Solutions S.A."
            minlength="${MIN_CARACTERES_NOMBRE}"
            maxlength="${MAX_CARACTERES_NOMBRE}"
            required
          />
          <small class="form-hint">Entre ${MIN_CARACTERES_NOMBRE} y ${MAX_CARACTERES_NOMBRE} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-industria">Industria *</label>
          <input
            type="text"
            id="campo-industria"
            name="industria"
            value="${industria}"
            placeholder="Ej. Desarrollo de Software"
            maxlength="${MAX_CARACTERES_INDUSTRIA}"
            required
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_INDUSTRIA} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-contacto">Persona de Contacto</label>
          <input
            type="text"
            id="campo-contacto"
            name="contacto"
            value="${contacto}"
            placeholder="Ej. Juan Pérez"
            maxlength="${MAX_CARACTERES_CONTACTO}"
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_CONTACTO} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-telefono">Teléfono</label>
          <input
            type="tel"
            id="campo-telefono"
            name="telefono"
            value="${telefono}"
            placeholder="Ej. +506 8888-8888"
            maxlength="${MAX_CARACTERES_TELEFONO}"
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_TELEFONO} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-email">Correo Electrónico</label>
          <input
            type="email"
            id="campo-email"
            name="email"
            value="${email}"
            placeholder="Ej. contacto@empresa.com"
            maxlength="${MAX_CARACTERES_EMAIL}"
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_EMAIL} caracteres.</small>
        </div>

        <div class="form-actions">
          <button type="submit" id="btn-submit-empresa" class="btn btn-primary">
            ${textoBotonSubmit}
          </button>
          <button type="button" id="btn-cancelar-empresa" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  `;
}

function validarCamposEmpresa(datos) {
  if (!datos.nombre || datos.nombre.length < MIN_CARACTERES_NOMBRE) {
    return {
      esValido: false,
      mensaje: `El nombre es obligatorio y debe tener al menos ${MIN_CARACTERES_NOMBRE} caracteres.`,
    };
  }

  if (datos.nombre.length > MAX_CARACTERES_NOMBRE) {
    return {
      esValido: false,
      mensaje: `El nombre no puede exceder los ${MAX_CARACTERES_NOMBRE} caracteres.`,
    };
  }

  if (!datos.industria) {
    return {
      esValido: false,
      mensaje: 'La industria es obligatoria.',
    };
  }

  if (datos.industria.length > MAX_CARACTERES_INDUSTRIA) {
    return {
      esValido: false,
      mensaje: `La industria no puede superar los ${MAX_CARACTERES_INDUSTRIA} caracteres.`,
    };
  }

  if (datos.contacto && datos.contacto.length > MAX_CARACTERES_CONTACTO) {
    return {
      esValido: false,
      mensaje: `El contacto no puede superar los ${MAX_CARACTERES_CONTACTO} caracteres.`,
    };
  }

  if (datos.telefono && datos.telefono.length > MAX_CARACTERES_TELEFONO) {
    return {
      esValido: false,
      mensaje: `El teléfono no puede superar los ${MAX_CARACTERES_TELEFONO} caracteres.`,
    };
  }

  if (datos.email) {
    if (datos.email.length > MAX_CARACTERES_EMAIL) {
      return {
        esValido: false,
        mensaje: `El email no puede superar los ${MAX_CARACTERES_EMAIL} caracteres.`,
      };
    }
    if (!PATRON_EMAIL.test(datos.email)) {
      return {
        esValido: false,
        mensaje: 'El formato del correo electrónico no es válido.',
      };
    }
  }

  return { esValido: true, mensaje: '' };
}

function obtenerSesion() {
  try {
    const s = localStorage.getItem('jobconnect_session');
    return s ? JSON.parse(s) : { nombre: 'Emily Johnson', rol: 'Reclutadora' };
  } catch {
    return { nombre: 'Emily Johnson', rol: 'Reclutadora' };
  }
}

function generarLayout(moduloActivo, contenidoPrincipal) {
  const sesion = obtenerSesion();
  const iniciales = sesion.nombre ? sesion.nombre.split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'EJ';
  const totalEmp = empresasCache.length || 4;

  return `
    <div class="dashboard">
      <!-- ── NAVBAR ── -->
      <header class="jc-navbar">
        <div class="jc-navbar-brand">
          <a href="/index.html" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
            <div class="jc-navbar-logo">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <span class="jc-navbar-name">JobConnect</span>
          </a>
        </div>

        <nav class="jc-navbar-links" aria-label="Navegación principal">
          <a href="/index.html" class="jc-nav-link ${moduloActivo === 'inicio' ? 'active' : ''}">Dashboard</a>
          <a href="/vacantes/vacantes.html" class="jc-nav-link ${moduloActivo === 'vacantes' ? 'active' : ''}">Vacantes</a>
          <a href="/empresas/empresas.html" class="jc-nav-link ${moduloActivo === 'empresas' ? 'active' : ''}">Empresas</a>
          <a href="/postulaciones/postulaciones.html" class="jc-nav-link ${moduloActivo === 'postulaciones' ? 'active' : ''}">Postulaciones</a>
          <a href="/entrevistas/entrevistas.html" class="jc-nav-link ${moduloActivo === 'entrevistas' ? 'active' : ''}">Entrevistas</a>
          <a href="/tareas-e-interfaz/tareas.html" class="jc-nav-link ${moduloActivo === 'tareas' ? 'active' : ''}">Tareas</a>
        </nav>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right; display: grid; gap: 1px;">
            <strong style="font-size: 14px; font-weight: 600; color: #F0F0F0;">${sesion.nombre}</strong>
            <span style="font-size: 12px; color: #606474;">${sesion.rol}</span>
          </div>
          <div class="jc-navbar-avatar" title="${sesion.nombre}">${iniciales}</div>
          <button id="logout-button" class="logout-button" type="button" title="Cerrar sesión" onclick="localStorage.removeItem('jobconnect_session'); window.location.href='/index.html';">Salir</button>
        </div>
      </header>

      <!-- ── LAYOUT ── -->
      <div class="dashboard-layout">
        <!-- ── SIDEBAR FIJO ── -->
        <aside class="sidebar">
          <div>
            <div class="sidebar-section-title">Módulos del Sistema</div>
            <nav aria-label="Módulos de JobConnect">
              <a href="/index.html" class="module-button ${moduloActivo === 'inicio' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">dashboard</span>
                  <span>Inicio</span>
                </div>
              </a>

              <a href="/vacantes/vacantes.html" class="module-button ${moduloActivo === 'vacantes' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">work</span>
                  <span>Vacantes</span>
                </div>
                <span class="module-badge-count">6</span>
              </a>

              <a href="/empresas/empresas.html" class="module-button ${moduloActivo === 'empresas' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">domain</span>
                  <span>Empresas</span>
                </div>
                <span class="module-badge-count">${totalEmp}</span>
              </a>

              <a href="/postulaciones/postulaciones.html" class="module-button ${moduloActivo === 'postulaciones' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">description</span>
                  <span>Postulaciones</span>
                </div>
                <span class="module-badge-count">6</span>
              </a>

              <a href="/entrevistas/entrevistas.html" class="module-button ${moduloActivo === 'entrevistas' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">calendar_month</span>
                  <span>Entrevistas</span>
                </div>
                <span class="module-badge-count">3</span>
              </a>

              <a href="/tareas-e-interfaz/tareas.html" class="module-button ${moduloActivo === 'tareas' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">task_alt</span>
                  <span>Tareas</span>
                </div>
                <span class="module-badge-count">5</span>
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
        <main class="dashboard-content">
          ${contenidoPrincipal}
        </main>
      </div>
    </div>
  `;
}

async function cargarYMostrarListado(container) {
  if (!container) return;

  const contenido = `
    <section class="empresas-section">
      <header class="empresas-header">
        <div>
          <h1 class="empresas-title">Gestión de Empresas</h1>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">Administra los convenios, clientes corporativos y contactos.</p>
        </div>
        <button type="button" id="btn-nueva-empresa" class="btn btn-primary" style="box-shadow: var(--shadow-accent);">
          + Nueva Empresa
        </button>
      </header>
      <div id="empresas-messages" class="empresas-messages" aria-live="polite"></div>
      <div id="empresas-content" class="empresas-content">
        <p class="loading-message">Cargando empresas...</p>
      </div>
    </section>
  `;

  container.innerHTML = generarLayout('empresas', contenido);

  const btnNuevaEmpresa = container.querySelector('#btn-nueva-empresa');
  const messagesContainer = container.querySelector('#empresas-messages');
  const contentContainer = container.querySelector('#empresas-content');

  if (btnNuevaEmpresa) {
    btnNuevaEmpresa.addEventListener('click', () => {
      mostrarFormularioEmpresa();
    });
  }

  if (contentContainer) {
    contentContainer.addEventListener('click', async (event) => {
      const botonAccion = event.target.closest('button[data-action]');
      if (!botonAccion) return;

      const { action, id } = botonAccion.dataset;

      if (action === 'edit') {
        const empresaSeleccionada = empresasCache.find(
          (item) => String(item.id) === String(id)
        );
        mostrarFormularioEmpresa(empresaSeleccionada || { id });
        return;
      }

      if (action === 'delete') {
        await eliminarEmpresa(id, messagesContainer, contentContainer);
      }
    });
  }

  await recargarListaEmpresas(contentContainer, messagesContainer);
}

export function mostrarFormularioEmpresa(empresa = null) {
  if (!appContainer) {
    console.error('El contenedor principal no ha sido inicializado.');
    return;
  }

  appContainer.innerHTML = generarLayout('empresas', construirFormularioEmpresa(empresa));

  const formulario = appContainer.querySelector('#form-empresa');
  const btnCancelar = appContainer.querySelector('#btn-cancelar-empresa');
  const messagesContainer = appContainer.querySelector('#form-messages');

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      cargarYMostrarListado(appContainer);
    });
  }

  if (formulario) {
    formulario.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(formulario);
      const datosEmpresa = {
        nombre: (formData.get('nombre') || '').trim(),
        industria: (formData.get('industria') || '').trim(),
        contacto: (formData.get('contacto') || '').trim(),
        telefono: (formData.get('telefono') || '').trim(),
        email: (formData.get('email') || '').trim(),
      };

      const validacion = validarCamposEmpresa(datosEmpresa);
      if (!validacion.esValido) {
        mostrarMensaje(messagesContainer, validacion.mensaje, true);
        return;
      }

      try {
        const esEdicion = Boolean(empresa && empresa.id);

        if (esEdicion) {
          await actualizarEmpresa(empresa.id, datosEmpresa);
        } else {
          await crearEmpresa(datosEmpresa);
        }

        await cargarYMostrarListado(appContainer);
        const nuevoMessagesContainer = appContainer.querySelector('#empresas-messages');
        mostrarMensaje(
          nuevoMessagesContainer,
          esEdicion ? MENSAJE_EXITO_ACTUALIZAR : MENSAJE_EXITO_CREAR
        );
      } catch (error) {
        mostrarMensaje(
          messagesContainer,
          `Error al guardar la empresa: ${error.message}`,
          true
        );
      }
    });
  }
}

export async function initEmpresas(container) {
  if (!container) {
    console.error('El contenedor proporcionado para initEmpresas no es válido.');
    return;
  }

  appContainer = container;
  await cargarYMostrarListado(appContainer);
}

const contenedorApp = document.querySelector('#app');
if (contenedorApp) {
  initEmpresas(contenedorApp);
}
