import { request } from '../services/api.js';

const ENDPOINT_VACANTES = '/vacantes';
const ESTADOS_VACANTE = ['abierta', 'cerrada', 'pausada'];

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
 * Genera el template HTML del formulario de creación o edición de vacantes.
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
            required
          />
        </div>

        <div class="form-group">
          <label for="campo-descripcion">Descripción *</label>
          <textarea
            id="campo-descripcion"
            name="descripcion"
            rows="4"
            placeholder="Descripción del puesto..."
            required
          >${descripcion}</textarea>
        </div>

        <div class="form-group">
          <label for="campo-empresa">Empresa</label>
          <input
            type="text"
            id="campo-empresa"
            name="empresa"
            value="${empresa}"
            placeholder="Nombre de la empresa"
          />
        </div>

        <div class="form-group">
          <label for="campo-salario">Salario</label>
          <input
            type="text"
            id="campo-salario"
            name="salario"
            value="${salario}"
            placeholder="Ej. 2500 USD"
          />
        </div>

        <div class="form-group">
          <label for="campo-requisitos">Requisitos</label>
          <textarea
            id="campo-requisitos"
            name="requisitos"
            rows="3"
            placeholder="Requisitos y tecnologías deseadas..."
          >${requisitos}</textarea>
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
 * Valida los campos obligatorios del formulario de vacante.
 *
 * @param {object} datos - Datos extraídos del formulario.
 * @returns {boolean} True si cumple las validaciones de campos requeridos.
 */
function validarCamposVacante(datos) {
  return Boolean(datos.titulo && datos.descripcion);
}

/**
 * Renderiza la vista de listado de vacantes y consulta los registros al servidor.
 *
 * @param {HTMLElement} container - Contenedor principal donde se muestra la vista.
 */
async function cargarYMostrarListado(container) {
  if (!container) return;

  container.innerHTML = `
    <section class="vacantes-section">
      <header class="vacantes-header">
        <h1 class="vacantes-title">Vacantes</h1>
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
    contentContainer.addEventListener('click', (event) => {
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
        console.log(`Acción: Eliminar vacante con ID ${id}`);
      }
    });
  }

  try {
    const vacantes = await request(ENDPOINT_VACANTES, 'GET');
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
 * Renderiza y gestiona el formulario de creación o edición de vacantes.
 *
 * @param {object|null} [vacante=null] - Datos de la vacante a editar o null para crear una nueva.
 */
export function mostrarFormularioVacante(vacante = null) {
  if (!appContainer) {
    console.error('El contenedor principal no ha sido inicializado.');
    return;
  }

  appContainer.innerHTML = construirFormularioVacante(vacante);

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

      if (!validarCamposVacante(datosVacante)) {
        mostrarMensaje(
          messagesContainer,
          'El título y la descripción son campos obligatorios.',
          true
        );
        return;
      }

      try {
        const esEdicion = Boolean(vacante && vacante.id);
        const endpoint = esEdicion
          ? `${ENDPOINT_VACANTES}/${vacante.id}`
          : ENDPOINT_VACANTES;
        const metodo = esEdicion ? 'PUT' : 'POST';

        await request(endpoint, metodo, datosVacante);
        await cargarYMostrarListado(appContainer);
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
