/**
 * ============================================================
 * tareas.js — Lógica de Negocio del Módulo de Tareas
 * ============================================================
 *
 * Gestiona el CRUD completo de tareas del reclutador:
 *  - GET    /tareas       → Listar todas las tareas
 *  - POST   /tareas       → Crear nueva tarea
 *  - PATCH  /tareas/:id   → Actualizar / marcar como completada
 *  - DELETE /tareas/:id   → Eliminar tarea
 *
 * Consume la API REST local simulada con json-server.
 * Utiliza async/await + try/catch en todas las peticiones.
 *
 * @module tareas
 * @author Equipo feature/tareas-ui
 */

import { mostrarAlerta, cerrarAlerta, abrirModal, cerrarModal, confirmar } from './ui.js';

// ─────────────────────────────────────────────
// 1. CONSTANTES
// ─────────────────────────────────────────────

/** URL base del endpoint de tareas en json-server */
const API_URL = 'http://localhost:3000/tareas';

/** Headers por defecto para peticiones con cuerpo JSON */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ─────────────────────────────────────────────
// 2. REFERENCIAS AL DOM
// ─────────────────────────────────────────────

const cuerpoTabla       = document.getElementById('cuerpo-tabla');
const estadoVacio        = document.getElementById('estado-vacio');
const skeletonCarga      = document.getElementById('skeleton-carga');
const btnNuevaTarea      = document.getElementById('btn-nueva-tarea');
const btnCerrarModal     = document.getElementById('btn-cerrar-modal');
const btnCancelarModal   = document.getElementById('btn-cancelar-modal');
const formTarea          = document.getElementById('form-tarea');
const modalTitulo        = document.getElementById('modal-titulo');
const inputId            = document.getElementById('tarea-id');
const inputTitulo        = document.getElementById('tarea-titulo');
const inputDescripcion   = document.getElementById('tarea-descripcion');
const inputEstado        = document.getElementById('tarea-estado');
const inputFecha         = document.getElementById('tarea-fecha');
const contadorTareas     = document.getElementById('contador-tareas');
const filtrosContainer   = document.getElementById('filtros-container');

// ─────────────────────────────────────────────
// 3. ESTADO LOCAL
// ─────────────────────────────────────────────

/** Almacena todas las tareas cargadas desde la API */
let tareasCache = [];

/** Filtro activo actualmente ('todas', 'pendiente', 'completada') */
let filtroActual = 'todas';

// ─────────────────────────────────────────────
// 4. FUNCIONES DE PETICIÓN (API)
// ─────────────────────────────────────────────

/**
 * Obtiene todas las tareas desde el servidor.
 * @returns {Promise<void>}
 */
async function cargarTareas() {
  mostrarSkeleton(true);

  try {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    tareasCache = await respuesta.json();
    renderizarTabla();
  } catch (error) {
    console.error('[tareas.js] Error al cargar tareas:', error);
    mostrarAlerta('No se pudieron cargar las tareas. Verifica que json-server esté corriendo.', 'error');
    cuerpoTabla.innerHTML = '';
    estadoVacio.classList.remove('hidden');
  } finally {
    mostrarSkeleton(false);
  }
}

/**
 * Crea una nueva tarea en el servidor.
 * @param {Object} datos - Datos de la tarea (titulo, descripcion, estado, fecha).
 * @returns {Promise<void>}
 */
async function crearTarea(datos) {
  const toastCarga = mostrarAlerta('Creando tarea...', 'carga');

  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    cerrarAlerta(toastCarga);
    mostrarAlerta('Tarea creada exitosamente', 'exito');
    cerrarModal('modal-tarea');
    await cargarTareas(); // Refrescar la tabla
  } catch (error) {
    cerrarAlerta(toastCarga);
    console.error('[tareas.js] Error al crear tarea:', error);
    mostrarAlerta('Error al crear la tarea. Intenta de nuevo.', 'error');
  }
}

/**
 * Actualiza parcialmente una tarea (edición o cambio de estado).
 * @param {string} id - ID de la tarea a actualizar.
 * @param {Object} datos - Campos a actualizar.
 * @returns {Promise<void>}
 */
async function actualizarTarea(id, datos) {
  const toastCarga = mostrarAlerta('Actualizando tarea...', 'carga');

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    cerrarAlerta(toastCarga);
    mostrarAlerta('Tarea actualizada correctamente', 'exito');
    cerrarModal('modal-tarea');
    await cargarTareas();
  } catch (error) {
    cerrarAlerta(toastCarga);
    console.error('[tareas.js] Error al actualizar tarea:', error);
    mostrarAlerta('Error al actualizar la tarea.', 'error');
  }
}

/**
 * Elimina una tarea del servidor previa confirmación del usuario.
 * @param {string} id - ID de la tarea a eliminar.
 * @returns {Promise<void>}
 */
async function eliminarTarea(id) {
  const aceptado = await confirmar('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.');

  if (!aceptado) return;

  const toastCarga = mostrarAlerta('Eliminando tarea...', 'carga');

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    cerrarAlerta(toastCarga);
    mostrarAlerta('Tarea eliminada correctamente', 'exito');
    await cargarTareas();
  } catch (error) {
    cerrarAlerta(toastCarga);
    console.error('[tareas.js] Error al eliminar tarea:', error);
    mostrarAlerta('Error al eliminar la tarea.', 'error');
  }
}

// ─────────────────────────────────────────────
// 5. FUNCIONES DE RENDERIZADO
// ─────────────────────────────────────────────

/**
 * Renderiza la tabla de tareas según el filtro activo.
 * Actualiza el contador y gestiona el estado vacío.
 */
function renderizarTabla() {
  // Filtrar tareas
  const tareasFiltradas = filtroActual === 'todas'
    ? tareasCache
    : tareasCache.filter((t) => t.estado === filtroActual);

  // Actualizar contador
  contadorTareas.textContent = `${tareasFiltradas.length} de ${tareasCache.length} tarea${tareasCache.length !== 1 ? 's' : ''}`;

  // Estado vacío
  if (tareasFiltradas.length === 0) {
    cuerpoTabla.innerHTML = '';
    estadoVacio.classList.remove('hidden');
    return;
  }

  estadoVacio.classList.add('hidden');

  // Construir filas
  cuerpoTabla.innerHTML = tareasFiltradas.map((tarea) => {
    const esPendiente = tarea.estado === 'pendiente';

    // Badge de estado
    const badgeEstado = esPendiente
      ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
           <span class="w-1.5 h-1.5 rounded-full bg-amber-400" style="animation: pulse-dot 2s infinite"></span>
           Pendiente
         </span>`
      : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
           <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
           </svg>
           Completada
         </span>`;

    // Botón completar/reabrir
    const btnToggleEstado = esPendiente
      ? `<button data-accion="completar" data-id="${tarea.id}" title="Marcar como completada"
                 class="p-2 rounded-xl text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10
                        transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
           </svg>
         </button>`
      : `<button data-accion="reabrir" data-id="${tarea.id}" title="Reabrir tarea"
                 class="p-2 rounded-xl text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10
                        transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
           </svg>
         </button>`;

    // Formatear fecha
    const fechaFormateada = formatearFecha(tarea.fecha);

    return `
      <tr class="group hover:bg-slate-800/40 transition-colors duration-150">
        <td data-label="Título" class="px-6 py-4">
          <span class="text-sm font-medium text-white ${!esPendiente ? 'line-through opacity-60' : ''}">
            ${escaparHTML(tarea.titulo)}
          </span>
        </td>
        <td data-label="Descripción" class="px-6 py-4 hidden md:table-cell">
          <span class="text-sm text-slate-400 line-clamp-1">
            ${escaparHTML(tarea.descripcion || '—')}
          </span>
        </td>
        <td data-label="Estado" class="px-6 py-4">
          ${badgeEstado}
        </td>
        <td data-label="Fecha" class="px-6 py-4 hidden sm:table-cell">
          <span class="text-sm text-slate-400">${fechaFormateada}</span>
        </td>
        <td data-label="Acciones" class="px-6 py-4">
          <div class="flex items-center justify-end gap-1">
            ${btnToggleEstado}
            <button data-accion="editar" data-id="${tarea.id}" title="Editar tarea"
                    class="p-2 rounded-xl text-indigo-400/70 hover:text-indigo-400 hover:bg-indigo-500/10
                           transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button data-accion="eliminar" data-id="${tarea.id}" title="Eliminar tarea"
                    class="p-2 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10
                           transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Controla la visibilidad del skeleton de carga.
 * @param {boolean} visible - Si true, muestra el skeleton y oculta la tabla.
 */
function mostrarSkeleton(visible) {
  if (visible) {
    skeletonCarga.classList.remove('hidden');
    cuerpoTabla.innerHTML = '';
    estadoVacio.classList.add('hidden');
  } else {
    skeletonCarga.classList.add('hidden');
  }
}

// ─────────────────────────────────────────────
// 6. FUNCIONES AUXILIARES
// ─────────────────────────────────────────────

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} texto
 * @returns {string} Texto con entidades HTML escapadas.
 */
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español.
 * @param {string} fecha - Fecha en formato ISO.
 * @returns {string} Fecha formateada (ej: "25 ago 2026").
 */
function formatearFecha(fecha) {
  try {
    const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
  } catch {
    return fecha; // Fallback al formato original
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD.
 * @returns {string}
 */
function fechaHoy() {
  return new Date().toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
// 7. GESTIÓN DEL MODAL (CREAR / EDITAR)
// ─────────────────────────────────────────────

/**
 * Abre el modal en modo "crear": limpia el formulario y ajusta el título.
 */
function abrirModalCrear() {
  formTarea.reset();
  inputId.value = '';
  inputFecha.value = fechaHoy();
  inputEstado.value = 'pendiente';
  modalTitulo.textContent = 'Nueva Tarea';
  abrirModal('modal-tarea');
}

/**
 * Abre el modal en modo "editar": precarga los datos de la tarea.
 * @param {string} id - ID de la tarea a editar.
 */
function abrirModalEditar(id) {
  const tarea = tareasCache.find((t) => String(t.id) === String(id));
  if (!tarea) {
    mostrarAlerta('No se encontró la tarea seleccionada.', 'error');
    return;
  }

  inputId.value = tarea.id;
  inputTitulo.value = tarea.titulo;
  inputDescripcion.value = tarea.descripcion || '';
  inputEstado.value = tarea.estado;
  inputFecha.value = tarea.fecha;
  modalTitulo.textContent = 'Editar Tarea';
  abrirModal('modal-tarea');
}

/**
 * Procesa el envío del formulario (crear o actualizar).
 * Valida campos requeridos antes de enviar.
 * @param {SubmitEvent} e
 */
async function procesarFormulario(e) {
  e.preventDefault();

  const titulo = inputTitulo.value.trim();
  const fecha  = inputFecha.value;

  // Validación básica
  if (!titulo) {
    mostrarAlerta('El título es obligatorio.', 'advertencia');
    inputTitulo.focus();
    return;
  }

  if (!fecha) {
    mostrarAlerta('La fecha es obligatoria.', 'advertencia');
    inputFecha.focus();
    return;
  }

  const datos = {
    titulo,
    descripcion: inputDescripcion.value.trim(),
    estado: inputEstado.value,
    fecha,
  };

  const id = inputId.value;

  if (id) {
    // Modo edición
    await actualizarTarea(id, datos);
  } else {
    // Modo creación
    await crearTarea(datos);
  }
}

// ─────────────────────────────────────────────
// 8. FILTROS
// ─────────────────────────────────────────────

/**
 * Aplica un filtro visual y lógico a los botones de filtro.
 * @param {string} filtro - Valor del filtro: 'todas', 'pendiente', 'completada'.
 */
function aplicarFiltro(filtro) {
  filtroActual = filtro;

  // Actualizar clases visuales de los botones
  const botones = filtrosContainer.querySelectorAll('.filtro-btn');
  botones.forEach((btn) => {
    const esFiltroActivo = btn.dataset.filtro === filtro;

    if (esFiltroActivo) {
      btn.className = `filtro-btn activo px-4 py-2 text-sm font-medium rounded-xl
                        bg-indigo-600/20 text-indigo-300 border border-indigo-500/30
                        hover:bg-indigo-600/30 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-indigo-400`;
    } else {
      btn.className = `filtro-btn px-4 py-2 text-sm font-medium rounded-xl
                        bg-slate-800/50 text-slate-400 border border-slate-700/50
                        hover:bg-slate-700/50 hover:text-slate-300 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-slate-500`;
    }
  });

  renderizarTabla();
}

// ─────────────────────────────────────────────
// 9. EVENT LISTENERS (DELEGACIÓN DE EVENTOS)
// ─────────────────────────────────────────────

/**
 * Delegación de eventos en la tabla para botones de acción.
 * Detecta clics en botones con atributo data-accion.
 */
cuerpoTabla.addEventListener('click', async (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;

  const accion = boton.dataset.accion;
  const id     = boton.dataset.id;

  switch (accion) {
    case 'completar':
      await actualizarTarea(id, { estado: 'completada' });
      break;

    case 'reabrir':
      await actualizarTarea(id, { estado: 'pendiente' });
      break;

    case 'editar':
      abrirModalEditar(id);
      break;

    case 'eliminar':
      await eliminarTarea(id);
      break;

    default:
      console.warn(`[tareas.js] Acción desconocida: "${accion}"`);
  }
});

// Botón "Nueva Tarea"
btnNuevaTarea.addEventListener('click', abrirModalCrear);

// Botones de cerrar modal
btnCerrarModal.addEventListener('click', () => cerrarModal('modal-tarea'));
btnCancelarModal.addEventListener('click', () => cerrarModal('modal-tarea'));

// Submit del formulario
formTarea.addEventListener('submit', procesarFormulario);

// Filtros
filtrosContainer.addEventListener('click', (e) => {
  const boton = e.target.closest('.filtro-btn');
  if (!boton) return;
  aplicarFiltro(boton.dataset.filtro);
});

// ─────────────────────────────────────────────
// 10. INICIALIZACIÓN
// ─────────────────────────────────────────────

/**
 * Punto de entrada: carga las tareas al iniciar la página.
 */
document.addEventListener('DOMContentLoaded', () => {
  cargarTareas();
});
