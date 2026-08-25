import { request } from '../services/api.js';

const ENDPOINT_VACANTES = '/vacantes';

/**
 * Renderiza la estructura base del módulo de vacantes en el contenedor.
 *
 * @param {HTMLElement} container - Elemento del DOM donde se inyectará el módulo.
 */
function renderBaseLayout(container) {
  container.innerHTML = `
    <section class="vacantes-section">
      <header class="vacantes-header">
        <h1 class="vacantes-title">Vacantes</h1>
        <button type="button" id="btn-create-vacante" class="btn btn-primary">
          Nueva Vacante
        </button>
      </header>
      <div id="vacantes-messages" class="vacantes-messages" aria-live="polite"></div>
      <div id="vacantes-content" class="vacantes-content">
        <p class="loading-message">Cargando vacantes...</p>
      </div>
    </section>
  `;
}

/**
 * Muestra un mensaje en el contenedor de alertas/notificaciones.
 *
 * @param {HTMLElement} messageContainer - Contenedor de mensajes en el DOM.
 * @param {string} message - Texto del mensaje a desplegar.
 * @param {boolean} [isError=false] - Indica si el mensaje representa un estado de error.
 */
function displayMessage(messageContainer, message, isError = false) {
  if (!messageContainer) return;
  const messageClass = isError ? 'message error' : 'message success';
  messageContainer.innerHTML = `<div class="${messageClass}">${message}</div>`;
}

/**
 * Genera el template HTML para una fila individual de vacante.
 *
 * @param {object} vacante - Objeto con los datos de la vacante.
 * @returns {string} Fila <tr> en formato HTML.
 */
function buildVacanteRow(vacante) {
  const id = vacante.id ?? '';
  const titulo = vacante.titulo || vacante.title || 'Sin título';
  const descripcion = vacante.descripcion || vacante.description || 'Sin descripción';
  const empresa = vacante.empresa || vacante.company || 'N/A';
  const salario = vacante.salario || vacante.salary || 'N/A';
  const estado = vacante.estado || vacante.status || 'Activo';

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
 * Genera el template HTML de la tabla con las vacantes provistas.
 *
 * @param {Array<object>} vacantes - Arreglo de vacantes recibidas del servidor.
 * @returns {string} Tabla en formato HTML o mensaje de lista vacía.
 */
function buildVacantesTable(vacantes) {
  if (!Array.isArray(vacantes) || vacantes.length === 0) {
    return '<p class="empty-message">No hay vacantes disponibles en este momento.</p>';
  }

  const rowsHtml = vacantes.map(buildVacanteRow).join('');

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
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

/**
 * Configura y escucha los eventos interactivos del módulo.
 *
 * @param {HTMLElement} container - Elemento contenedor principal.
 */
function setupEventListeners(container) {
  const createButton = container.querySelector('#btn-create-vacante');
  if (createButton) {
    createButton.addEventListener('click', () => {
      console.log('Acción: Crear nueva vacante');
    });
  }

  const contentContainer = container.querySelector('#vacantes-content');
  if (contentContainer) {
    contentContainer.addEventListener('click', (event) => {
      const actionButton = event.target.closest('button[data-action]');
      if (!actionButton) return;

      const { action, id } = actionButton.dataset;

      if (action === 'edit') {
        console.log(`Acción: Editar vacante con ID ${id}`);
        return;
      }

      if (action === 'delete') {
        console.log(`Acción: Eliminar vacante con ID ${id}`);
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

  renderBaseLayout(container);

  const messagesContainer = container.querySelector('#vacantes-messages');
  const contentContainer = container.querySelector('#vacantes-content');

  setupEventListeners(container);

  try {
    const vacantes = await request(ENDPOINT_VACANTES, 'GET');
    contentContainer.innerHTML = buildVacantesTable(vacantes);
  } catch (error) {
    contentContainer.innerHTML = '';
    displayMessage(
      messagesContainer,
      `Error al cargar las vacantes: ${error.message}`,
      true
    );
  }
}
