import {
  obtenerVacantes,
  crearVacante,
  actualizarVacante,
  eliminarVacantePorId,
} from '../src/services/vacantesService.js';

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

let appContainer = null;
let vacantesCache = [];

/**
 * Muestra un mensaje de alerta o notificación en el contenedor provisto.
 *
 * @param {HTMLElement} messageContainer - Contenedor en el DOM para mensajes.
 * @param {string} message - Texto del mensaje a desplegar.
 * @param {boolean} [isError=false] - Indica si el mensaje es de tipo error.
 */
function mostrarMensaje(messageContainer, message, isError = false) {
  if (!messageContainer) return;
  const tipoClase = isError ? 'message error' : 'message success';
  messageContainer.innerHTML = `<div class="${tipoClase}">${message}</div>`;
}

/**
 * Genera el template HTML de una fila individual para la tabla de vacantes.
 *
 * @param {object} vacante - Objeto con los datos de la vacante.
 * @returns {string} Fila <tr> en formato HTML.
 */
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

/**
 * Genera el template HTML de la tabla con la lista de vacantes.
 *
 * @param {Array<object>} vacantes - Lista de vacantes a renderizar.
 * @returns {string} Tabla HTML o mensaje de lista vacía.
 */
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

/**
 * Consulta la API y recarga el contenido de la tabla de vacantes.
 *
 * @param {HTMLElement} contentContainer - Contenedor donde se inserta la tabla.
 * @param {HTMLElement} messagesContainer - Contenedor para mostrar mensajes de error.
 */
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

/**
 * Gestiona el proceso de confirmación y eliminación de una vacante por ID.
 *
 * @param {string|number} id - Identificador único de la vacante a eliminar.
 * @param {HTMLElement} messagesContainer - Contenedor para notificar el resultado.
 * @param {HTMLElement} contentContainer - Contenedor de la tabla a actualizar.
 */
async function eliminarVacante(id, messagesContainer, contentContainer) {
  if (!id) return;

  const confirmacionUsuario = window.confirm(MENSAJE_CONFIRMAR_ELIMINAR);
  if (!confirmacionUsuario) return;

  try {
    await eliminarVacantePorId(id);
    await recargarListaVacantes(contentContainer, messagesContainer);
    mostrarMensaje(messagesContainer, MENSAJE_EXITO_ELIMINAR);
  } catch (error) {
    mostrarMensaje(
      messagesContainer,
      `Error al eliminar la vacante: ${error.message}`,
      true
    );
  }
}

/**
 * Genera el template HTML del formulario de creación o edición de vacantes con restricciones de caracteres.
 *
 * @param {object|null} [vacante=null] - Datos de la vacante a precargar si se está editando.
 * @returns {string} Formulario HTML.
 */
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

/**
 * Valida los campos y restricciones de caracteres del formulario de vacante.
 *
 * @param {object} datos - Datos extraídos del formulario.
 * @returns {{esValido: boolean, mensaje: string}} Objeto con el resultado y mensaje explicativo.
 */
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

/**
 * Renderiza la vista de listado de vacantes y configura los manejadores de eventos.
 *
 * @param {HTMLElement} container - Contenedor principal donde se muestra la vista.
 */
async function cargarYMostrarListado(container) {
  if (!container) return;

  container.innerHTML = `
    <nav class="main-nav">
      <a href="../index.html" class="nav-link">Inicio</a>
      <a href="./vacantes.html" class="nav-link active">Vacantes</a>
      <a href="./empresas.html" class="nav-link">Empresas</a>
    </nav>
    <section class="vacantes-section">
      <header class="vacantes-header">
        <h1 class="vacantes-title">Gestión de Vacantes</h1>
        <button type="button" id="btn-nueva-vacante" class="btn btn-primary">
          Nueva Vacante
        </button>
      </header>
      <div id="vacantes-messages" class="vacantes-messages" aria-live="polite"></div>
      <div id="vacantes-content" class="vacantes-content">
        <p class="loading-message">Cargando vacantes...</p>
      </div>
    </section>
  `;

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

/**
 * Renderiza y gestiona el formulario de creación o edición de vacantes.
 *
 * @param {object|null} [vacante=null] - Datos de la vacante a editar o null para crear una nueva.
 */
export function mostrarFormularioVacante(vacante = null) {
  if (!appContainer) {
    console.error('El contenedor principal no ha sido inicializado.');
    return;
  }

  appContainer.innerHTML = `
    <nav class="main-nav">
      <a href="../index.html" class="nav-link">Inicio</a>
      <a href="./vacantes.html" class="nav-link active">Vacantes</a>
      <a href="./empresas.html" class="nav-link">Empresas</a>
    </nav>
    ${construirFormularioVacante(vacante)}
  `;

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

/**
 * Inicializa y renderiza la vista de vacantes en el contenedor provisto.
 *
 * @param {HTMLElement} container - Contenedor del DOM donde se montará la vista.
 */
export async function initVacantes(container) {
  if (!container) {
    console.error('El contenedor proporcionado para initVacantes no es válido.');
    return;
  }

  appContainer = container;
  await cargarYMostrarListado(appContainer);
}

// Inicialización automática al cargar el módulo si existe el elemento #app
const contenedorApp = document.querySelector('#app');
if (contenedorApp) {
  initVacantes(contenedorApp);
}
