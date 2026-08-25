import {
  obtenerEmpresas,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresaPorId,
} from '../src/services/empresasService.js';

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
 * Genera el template HTML de una fila individual para la tabla de empresas.
 *
 * @param {object} empresa - Objeto con los datos de la empresa.
 * @returns {string} Fila <tr> en formato HTML.
 */
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

/**
 * Genera el template HTML de la tabla con la lista de empresas.
 *
 * @param {Array<object>} empresas - Lista de empresas a renderizar.
 * @returns {string} Tabla HTML o mensaje de lista vacía.
 */
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

/**
 * Consulta la API y recarga el contenido de la tabla de empresas.
 *
 * @param {HTMLElement} contentContainer - Contenedor donde se inserta la tabla.
 * @param {HTMLElement} messagesContainer - Contenedor para mostrar mensajes de error.
 */
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

/**
 * Gestiona el proceso de confirmación y eliminación de una empresa por ID.
 *
 * @param {string|number} id - Identificador único de la empresa a eliminar.
 * @param {HTMLElement} messagesContainer - Contenedor para notificar el resultado.
 * @param {HTMLElement} contentContainer - Contenedor de la tabla a actualizar.
 */
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

/**
 * Genera el template HTML del formulario de creación o edición de empresas con restricciones de caracteres.
 *
 * @param {object|null} [empresa=null] - Datos de la empresa a precargar si se está editando.
 * @returns {string} Formulario HTML.
 */
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
          <label for="campo-nombre">Nombre *</label>
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
          <label for="campo-industria">Industria</label>
          <input
            type="text"
            id="campo-industria"
            name="industria"
            value="${industria}"
            placeholder="Ej. Tecnología, Finanzas, Salud..."
            maxlength="${MAX_CARACTERES_INDUSTRIA}"
          />
          <small class="form-hint">Máximo ${MAX_CARACTERES_INDUSTRIA} caracteres.</small>
        </div>

        <div class="form-group">
          <label for="campo-contacto">Contacto</label>
          <input
            type="text"
            id="campo-contacto"
            name="contacto"
            value="${contacto}"
            placeholder="Nombre del contacto o departamento"
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
          <label for="campo-email">Email</label>
          <input
            type="email"
            id="campo-email"
            name="email"
            value="${email}"
            placeholder="contacto@empresa.com"
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

/**
 * Valida los campos y restricciones de caracteres del formulario de empresa.
 *
 * @param {object} datos - Datos extraídos del formulario.
 * @returns {{esValido: boolean, mensaje: string}} Objeto con el resultado y mensaje explicativo.
 */
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

  if (datos.industria && datos.industria.length > MAX_CARACTERES_INDUSTRIA) {
    return {
      esValido: false,
      mensaje: `El campo industria no puede superar ${MAX_CARACTERES_INDUSTRIA} caracteres.`,
    };
  }

  if (datos.contacto && datos.contacto.length > MAX_CARACTERES_CONTACTO) {
    return {
      esValido: false,
      mensaje: `El campo contacto no puede superar ${MAX_CARACTERES_CONTACTO} caracteres.`,
    };
  }

  if (datos.telefono && datos.telefono.length > MAX_CARACTERES_TELEFONO) {
    return {
      esValido: false,
      mensaje: `El teléfono no puede superar ${MAX_CARACTERES_TELEFONO} caracteres.`,
    };
  }

  if (datos.email) {
    if (datos.email.length > MAX_CARACTERES_EMAIL) {
      return {
        esValido: false,
        mensaje: `El correo electrónico no puede superar ${MAX_CARACTERES_EMAIL} caracteres.`,
      };
    }

    if (!PATRON_EMAIL.test(datos.email)) {
      return {
        esValido: false,
        mensaje: 'El formato del correo electrónico ingresado no es válido (ejemplo: contacto@empresa.com).',
      };
    }
  }

  return { esValido: true, mensaje: '' };
}

/**
 * Renderiza la vista de listado de empresas y configura los manejadores de eventos.
 *
 * @param {HTMLElement} container - Contenedor principal donde se muestra la vista.
 */
async function cargarYMostrarListado(container) {
  if (!container) return;

  container.innerHTML = `
    <nav class="main-nav">
      <a href="../index.html" class="nav-link">Inicio</a>
      <a href="./vacantes.html" class="nav-link">Vacantes</a>
      <a href="./empresas.html" class="nav-link active">Empresas</a>
    </nav>
    <section class="empresas-section">
      <header class="empresas-header">
        <h1 class="empresas-title">Gestión de Empresas</h1>
        <button type="button" id="btn-nueva-empresa" class="btn btn-primary">
          Nueva Empresa
        </button>
      </header>
      <div id="empresas-messages" class="empresas-messages" aria-live="polite"></div>
      <div id="empresas-content" class="empresas-content">
        <p class="loading-message">Cargando empresas...</p>
      </div>
    </section>
  `;

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

/**
 * Renderiza y gestiona el formulario de creación o edición de empresas.
 *
 * @param {object|null} [empresa=null] - Datos de la empresa a editar o null para crear una nueva.
 */
export function mostrarFormularioEmpresa(empresa = null) {
  if (!appContainer) {
    console.error('El contenedor principal no ha sido inicializado.');
    return;
  }

  appContainer.innerHTML = `
    <nav class="main-nav">
      <a href="../index.html" class="nav-link">Inicio</a>
      <a href="./vacantes.html" class="nav-link">Vacantes</a>
      <a href="./empresas.html" class="nav-link active">Empresas</a>
    </nav>
    ${construirFormularioEmpresa(empresa)}
  `;

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

/**
 * Inicializa y renderiza la vista de empresas en el contenedor provisto.
 *
 * @param {HTMLElement} container - Contenedor del DOM donde se montará la vista.
 */
export async function initEmpresas(container) {
  if (!container) {
    console.error('El contenedor proporcionado para initEmpresas no es válido.');
    return;
  }

  appContainer = container;
  await cargarYMostrarListado(appContainer);
}

// Inicialización automática al cargar el módulo si existe el elemento #app
const contenedorApp = document.querySelector('#app');
if (contenedorApp) {
  initEmpresas(contenedorApp);
}
