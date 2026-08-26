import {
  obtenerVacantes,
  crearVacante,
  actualizarVacante,
  eliminarVacantePorId,
} from './vacantesService.js';
import { mostrarToast, confirmarAccion } from '../src/services/api.js';

const ESTADOS_VACANTE = ['abierta', 'cerrada', 'pausada'];
const MENSAJE_CONFIRMAR_ELIMINAR = '¿Estás seguro de eliminar esta vacante?';
const MENSAJE_EXITO_CREAR = 'Vacante creada exitosamente';
const MENSAJE_EXITO_ACTUALIZAR = 'Vacante actualizada exitosamente';
const MENSAJE_EXITO_ELIMINAR = 'Vacante eliminada correctamente';

const MIN_CARACTERES_TITULO = 3;
const MAX_CARACTERES_TITULO = 100;
const MIN_CARACTERES_DESCRIPCION = 10;
const MAX_CARACTERES_DESCRIPCION = 1000;
const MAX_CARACTERES_EMPRESA = 80;
const MAX_CARACTERES_SALARIO = 50;
const MAX_CARACTERES_REQUISITOS = 500;

// Control de acceso por rol
try {
  const session = JSON.parse(localStorage.getItem('jobconnect_session') || '{}');
  if (session.rol === 'Postulante') {
    window.location.href = '/index.html';
  }
} catch (e) {
  console.warn('Error al verificar sesión:', e);
}

let appContainer = null;
let vacantesCache = [];

function mostrarMensaje(messageContainer, message, isError = false) {
  if (!messageContainer) return;
  const tipoClase = isError ? 'message error' : 'message success';
  messageContainer.innerHTML = `<div class="${tipoClase}">${message}</div>`;
}

function construirFilaVacante(vacante) {
  const id = vacante.id ?? '';
  const titulo = vacante.titulo || vacante.title || 'Sin título';
  const descripcion = vacante.descripcion || vacante.description || 'Sin descripción';
  const empresa = vacante.empresa || vacante.company || 'N/A';
  const salario = vacante.salario || vacante.salary || 'N/A';
  const estado = vacante.estado || vacante.status || 'abierta';

  return `
    <tr data-id="${id}">
      <td>${titulo}</td>
      <td>${descripcion}</td>
      <td>${empresa}</td>
      <td>${salario}</td>
      <td><span class="badge status-${String(estado).toLowerCase()}">${estado}</span></td>
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

function construirTablaVacantes(vacantes) {
  if (!Array.isArray(vacantes) || vacantes.length === 0) {
    return '<p class="empty-message">No hay vacantes disponibles en este momento.</p>';
  }

  const filasHtml = vacantes.map(construirFilaVacante).join('');

  return `
    <table class="vacantes-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Descripción</th>
          <th>Empresa</th>
          <th>Salario</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${filasHtml}
      </tbody>
    </table>
  `;
}

async function recargarListaVacantes(contentContainer, messagesContainer) {
  try {
    const vacantes = await obtenerVacantes();
    vacantesCache = Array.isArray(vacantes) ? vacantes : [];
    contentContainer.innerHTML = construirTablaVacantes(vacantesCache);
  } catch (error) {
    vacantesCache = [];
    contentContainer.innerHTML = '';
    mostrarMensaje(
      messagesContainer,
      `Error al cargar las vacantes: ${error.message}`,
      true
    );
  }
}

async function eliminarVacante(id, messagesContainer, contentContainer) {
  if (!id) return;

  confirmarAccion('Eliminar Vacante', MENSAJE_CONFIRMAR_ELIMINAR, async () => {
    try {
      await eliminarVacantePorId(id);
      await recargarListaVacantes(contentContainer, messagesContainer);
      mostrarMensaje(messagesContainer, MENSAJE_EXITO_ELIMINAR);
      mostrarToast(MENSAJE_EXITO_ELIMINAR, 'success');
    } catch (error) {
      mostrarMensaje(
        messagesContainer,
        `Error al eliminar la vacante: ${error.message}`,
        true
      );
      mostrarToast(`Error al eliminar: ${error.message}`, 'error');
    }
  });
}

function construirFormularioVacante(vacante = null) {
  const esEdicion = Boolean(vacante && vacante.id);
  const tituloVista = esEdicion ? 'Editar Vacante' : 'Nueva Vacante';
  const textoBotonSubmit = esEdicion ? 'Guardar Cambios' : 'Crear Vacante';

  const titulo = vacante?.titulo || vacante?.title || '';
  const descripcion = vacante?.descripcion || vacante?.description || '';
  const empresa = vacante?.empresa || vacante?.company || '';
  const salario = vacante?.salario || vacante?.salary || '';
  const requisitos = vacante?.requisitos || vacante?.requirements || '';
  const estadoActual = (vacante?.estado || vacante?.status || 'abierta').toLowerCase();

  const opcionesEstado = ESTADOS_VACANTE.map((estado) => {
    const selected = estado === estadoActual ? 'selected' : '';
    const label = estado.charAt(0).toUpperCase() + estado.slice(1);
    return `<option value="${estado}" ${selected}>${label}</option>`;
  }).join('');

  return `
    <section class="vacantes-form-section">
      <header class="form-header">
        <h2 class="form-title">${tituloVista}</h2>
      </header>
      <div id="form-messages" class="form-messages" aria-live="polite"></div>
      <form id="form-vacante" class="form-vacante" novalidate>
        <div class="form-group">
          <label for="campo-titulo">Título *</label>
          <input
            type="text"
            id="campo-titulo"
            name="titulo"
            value="${titulo}"
            placeholder="Ej. Desarrollador Frontend"
            minlength="${MIN_CARACTERES_TITULO}"
            maxlength="${MAX_CARACTERES_TITULO}"
            required
          />
          <small class="form-hint">Entre ${MIN_CARACTERES_TITULO} y ${MAX_CARACTERES_TITULO} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-descripcion">Descripción *</label>
          <textarea
            id="campo-descripcion"
            name="descripcion"
            rows="4"
            placeholder="Descripción del puesto..."
            minlength="${MIN_CARACTERES_DESCRIPCION}"
            maxlength="${MAX_CARACTERES_DESCRIPCION}"
            required
          >${descripcion}</textarea>
          <small class="form-hint">Entre ${MIN_CARACTERES_DESCRIPCION} y ${MAX_CARACTERES_DESCRIPCION} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-empresa">Empresa</label>
          <input
            type="text"
            id="campo-empresa"
            name="empresa"
            value="${empresa}"
            placeholder="Nombre de la empresa"
            maxlength="${MAX_CARACTERES_EMPRESA}"
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_EMPRESA} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-salario">Salario</label>
          <input
            type="text"
            id="campo-salario"
            name="salario"
            value="${salario}"
            placeholder="Ej. 2500 USD"
            maxlength="${MAX_CARACTERES_SALARIO}"
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_SALARIO} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-requisitos">Requisitos</label>
          <textarea
            id="campo-requisitos"
            name="requisitos"
            rows="3"
            placeholder="Requisitos y tecnologías deseadas..."
            maxlength="${MAX_CARACTERES_REQUISITOS}"
          >${requisitos}</textarea>
          <small class="form-hint">Máximo ${MAX_CARACTERES_REQUISITOS} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-estado">Estado</label>
          <select id="campo-estado" name="estado">
            ${opcionesEstado}
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" id="btn-submit-vacante" class="btn btn-primary">
            ${textoBotonSubmit}
          </button>
          <button type="button" id="btn-cancelar-vacante" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  `;
}

function validarCamposVacante(datos) {
  if (!datos.titulo || datos.titulo.length < MIN_CARACTERES_TITULO) {
    return {
      esValido: false,
      mensaje: `El título es obligatorio y debe tener al menos ${MIN_CARACTERES_TITULO} caracteres.`,
    };
  }

  if (datos.titulo.length > MAX_CARACTERES_TITULO) {
    return {
      esValido: false,
      mensaje: `El título no puede exceder los ${MAX_CARACTERES_TITULO} caracteres.`,
    };
  }

  if (!datos.descripcion || datos.descripcion.length < MIN_CARACTERES_DESCRIPCION) {
    return {
      esValido: false,
      mensaje: `La descripción es obligatoria y debe tener al menos ${MIN_CARACTERES_DESCRIPCION} caracteres.`,
    };
  }

  if (datos.descripcion.length > MAX_CARACTERES_DESCRIPCION) {
    return {
      esValido: false,
      mensaje: `La descripción no puede exceder los ${MAX_CARACTERES_DESCRIPCION} caracteres.`,
    };
  }

  if (datos.empresa && datos.empresa.length > MAX_CARACTERES_EMPRESA) {
    return {
      esValido: false,
      mensaje: `El nombre de la empresa no puede superar ${MAX_CARACTERES_EMPRESA} caracteres.`,
    };
  }

  if (datos.salario && datos.salario.length > MAX_CARACTERES_SALARIO) {
    return {
      esValido: false,
      mensaje: `El campo salario no puede superar ${MAX_CARACTERES_SALARIO} caracteres.`,
    };
  }

  if (datos.requisitos && datos.requisitos.length > MAX_CARACTERES_REQUISITOS) {
    return {
      esValido: false,
      mensaje: `Los requisitos no pueden superar ${MAX_CARACTERES_REQUISITOS} caracteres.`,
    };
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
  const totalVac = vacantesCache.length || 6;

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
                <span class="module-badge-count">${totalVac}</span>
              </a>

              <a href="/empresas/empresas.html" class="module-button ${moduloActivo === 'empresas' ? 'active' : ''}">
                <div class="module-button-content">
                  <span class="material-symbols-rounded module-button-icon">domain</span>
                  <span>Empresas</span>
                </div>
                <span class="module-badge-count">4</span>
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
    <section class="vacantes-section">
      <header class="vacantes-header">
        <div>
          <h1 class="vacantes-title">Gestión de Vacantes</h1>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">Administra y publica las oportunidades laborales de tu empresa.</p>
        </div>
        <button type="button" id="btn-nueva-vacante" class="btn btn-primary" style="box-shadow: var(--shadow-accent);">
          + Nueva Vacante
        </button>
      </header>
      <div id="vacantes-messages" class="vacantes-messages" aria-live="polite"></div>
      <div id="vacantes-content" class="vacantes-content">
        <p class="loading-message">Cargando vacantes...</p>
      </div>
    </section>
  `;

  container.innerHTML = generarLayout('vacantes', contenido);

  const btnNuevaVacante = container.querySelector('#btn-nueva-vacante');
  const messagesContainer = container.querySelector('#vacantes-messages');
  const contentContainer = container.querySelector('#vacantes-content');

  if (btnNuevaVacante) {
    btnNuevaVacante.addEventListener('click', () => {
      mostrarFormularioVacante();
    });
  }

  if (contentContainer) {
    contentContainer.addEventListener('click', async (event) => {
      const botonAccion = event.target.closest('button[data-action]');
      if (!botonAccion) return;

      const { action, id } = botonAccion.dataset;

      if (action === 'edit') {
        const vacanteSeleccionada = vacantesCache.find(
          (item) => String(item.id) === String(id)
        );
        mostrarFormularioVacante(vacanteSeleccionada || { id });
        return;
      }

      if (action === 'delete') {
        await eliminarVacante(id, messagesContainer, contentContainer);
      }
    });
  }

  await recargarListaVacantes(contentContainer, messagesContainer);
}

export function mostrarFormularioVacante(vacante = null) {
  if (!appContainer) {
    console.error('El contenedor principal no ha sido inicializado.');
    return;
  }

  appContainer.innerHTML = generarLayout('vacantes', construirFormularioVacante(vacante));

  const formulario = appContainer.querySelector('#form-vacante');
  const btnCancelar = appContainer.querySelector('#btn-cancelar-vacante');
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
      const datosVacante = {
        titulo: (formData.get('titulo') || '').trim(),
        descripcion: (formData.get('descripcion') || '').trim(),
        empresa: (formData.get('empresa') || '').trim(),
        salario: (formData.get('salario') || '').trim(),
        requisitos: (formData.get('requisitos') || '').trim(),
        estado: formData.get('estado') || 'abierta',
      };

      const validacion = validarCamposVacante(datosVacante);
      if (!validacion.esValido) {
        mostrarMensaje(messagesContainer, validacion.mensaje, true);
        return;
      }

      try {
        const esEdicion = Boolean(vacante && vacante.id);

        if (esEdicion) {
          await actualizarVacante(vacante.id, datosVacante);
        } else {
          await crearVacante(datosVacante);
        }

        await cargarYMostrarListado(appContainer);
        const nuevoMessagesContainer = appContainer.querySelector('#vacantes-messages');
        mostrarMensaje(
          nuevoMessagesContainer,
          esEdicion ? MENSAJE_EXITO_ACTUALIZAR : MENSAJE_EXITO_CREAR
        );
      } catch (error) {
        mostrarMensaje(
          messagesContainer,
          `Error al guardar la vacante: ${error.message}`,
          true
        );
      }
    });
  }
}

export async function initVacantes(container) {
  if (!container) {
    console.error('El contenedor proporcionado para initVacantes no es válido.');
    return;
  }

  appContainer = container;
  await cargarYMostrarListado(appContainer);
}

const contenedorApp = document.querySelector('#app');
if (contenedorApp) {
  initVacantes(contenedorApp);
}
