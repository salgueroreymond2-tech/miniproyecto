/**
 * ============================================================
 * ui.js — Módulo de Utilidades UI para JobConnect
 * ============================================================
 *
 * Exporta funciones reutilizables para:
 *  - Sistema de alertas flotantes (toast/notificaciones)
 *  - Control de apertura/cierre de modales con accesibilidad
 *  - Modal de confirmación con Promise
 *
 * Uso desde otros módulos:
 *   import { mostrarAlerta, abrirModal, cerrarModal, confirmar } from './ui.js';
 *
 * @module ui
 * @author Equipo feature/tareas-ui
 */

// ─────────────────────────────────────────────
// 1. CONSTANTES Y CONFIGURACIÓN
// ─────────────────────────────────────────────

/** Duración en ms antes de que un toast se auto-destruya */
const TOAST_DURACION = 4000;

/** Configuración visual por tipo de alerta */
const TIPOS_ALERTA = {
  exito: {
    icono: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`,
    clases: 'bg-emerald-600/90 text-white border-emerald-400/30',
  },
  error: {
    icono: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`,
    clases: 'bg-rose-600/90 text-white border-rose-400/30',
  },
  advertencia: {
    icono: `<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.58 14.86A1 1 0 002.59 20h18.82a1 1 0 00.87-1.28L13.71 3.86a1 1 0 00-1.42 0z"/>
            </svg>`,
    clases: 'bg-amber-500/90 text-white border-amber-400/30',
  },
  carga: {
    icono: `<svg class="w-5 h-5 shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>`,
    clases: 'bg-indigo-600/90 text-white border-indigo-400/30',
  },
};

// ─────────────────────────────────────────────
// 2. SISTEMA DE ALERTAS / TOASTS
// ─────────────────────────────────────────────

/**
 * Obtiene (o crea) el contenedor de toasts en el DOM.
 * Se posiciona en la esquina superior derecha de la pantalla.
 * @returns {HTMLElement} Contenedor de toasts
 */
function obtenerContenedorToasts() {
  let contenedor = document.getElementById('toast-container');

  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toast-container';
    contenedor.className =
      'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
    contenedor.setAttribute('aria-live', 'assertive');
    contenedor.setAttribute('aria-atomic', 'true');
    document.body.appendChild(contenedor);
  }

  return contenedor;
}

/**
 * Muestra una alerta flotante (toast) con animación.
 *
 * @param {string} mensaje - Texto a mostrar en la notificación.
 * @param {'exito'|'error'|'advertencia'|'carga'} tipo - Tipo de alerta.
 * @returns {HTMLElement} El elemento del toast (útil para cerrar manualmente los de tipo 'carga').
 *
 * @example
 *   // Toast de éxito (se cierra solo en 4s)
 *   mostrarAlerta('Tarea creada exitosamente', 'exito');
 *
 *   // Toast de carga (se cierra manualmente)
 *   const loader = mostrarAlerta('Guardando...', 'carga');
 *   // ... después de la operación:
 *   cerrarAlerta(loader);
 */
export function mostrarAlerta(mensaje, tipo = 'exito') {
  const contenedor = obtenerContenedorToasts();
  const config = TIPOS_ALERTA[tipo] || TIPOS_ALERTA.exito;

  // Crear el elemento toast
  const toast = document.createElement('div');
  toast.role = 'alert';
  toast.className = `
    pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
    border backdrop-blur-sm shadow-2xl shadow-black/20
    transform translate-x-full opacity-0
    transition-all duration-500 ease-out
    min-w-[280px] max-w-[420px]
    ${config.clases}
  `.trim();

  toast.innerHTML = `
    ${config.icono}
    <span class="text-sm font-medium flex-1">${mensaje}</span>
    ${tipo !== 'carga' ? `
      <button class="toast-cerrar ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Cerrar notificación" title="Cerrar">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    ` : ''}
  `;

  contenedor.appendChild(toast);

  // Animar entrada
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
  });

  // Botón de cerrar manual
  const btnCerrar = toast.querySelector('.toast-cerrar');
  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => cerrarAlerta(toast));
  }

  // Auto-cerrar (excepto toasts de carga)
  if (tipo !== 'carga') {
    setTimeout(() => cerrarAlerta(toast), TOAST_DURACION);
  }

  return toast;
}

/**
 * Cierra y elimina un toast específico con animación de salida.
 * @param {HTMLElement} toast - Elemento del toast a cerrar.
 */
export function cerrarAlerta(toast) {
  if (!toast || !toast.parentNode) return;

  toast.classList.add('translate-x-full', 'opacity-0');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });

  // Fallback por si transitionend no se dispara
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 600);
}

// ─────────────────────────────────────────────
// 3. SISTEMA DE MODALES
// ─────────────────────────────────────────────

/** Almacena el elemento que tenía el foco antes de abrir el modal */
let _elementoFocoPrevio = null;

/**
 * Obtiene todos los elementos focusables dentro de un contenedor.
 * @param {HTMLElement} contenedor
 * @returns {HTMLElement[]}
 */
function obtenerFocusables(contenedor) {
  const selectores = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return [...contenedor.querySelectorAll(selectores.join(','))];
}

/**
 * Gestiona el trap de foco dentro de un modal.
 * El foco cíclico queda contenido entre el primer y último elemento focusable.
 * @param {KeyboardEvent} e
 * @param {HTMLElement} modal
 */
function gestionarFocusTrap(e, modal) {
  if (e.key !== 'Tab') return;

  const focusables = obtenerFocusables(modal);
  if (focusables.length === 0) return;

  const primero = focusables[0];
  const ultimo = focusables[focusables.length - 1];

  if (e.shiftKey) {
    // Shift+Tab: si el foco está en el primer elemento, ir al último
    if (document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    }
  } else {
    // Tab: si el foco está en el último elemento, ir al primero
    if (document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }
}

/**
 * Abre un modal identificado por su ID.
 * Gestiona `aria-hidden`, focus trap y cierre con tecla Escape.
 *
 * @param {string} idModal - ID del elemento modal en el DOM.
 *
 * @example
 *   abrirModal('modal-tarea');
 */
export function abrirModal(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) {
    console.warn(`[ui.js] Modal con id "${idModal}" no encontrado.`);
    return;
  }

  // Guardar foco actual para restaurarlo al cerrar
  _elementoFocoPrevio = document.activeElement;

  // Mostrar modal
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Evitar scroll del fondo

  // Mover foco al primer elemento focusable del modal
  requestAnimationFrame(() => {
    const focusables = obtenerFocusables(modal);
    if (focusables.length > 0) {
      focusables[0].focus();
    }
  });

  // Listeners para cerrar y trap de foco
  const handlerKeydown = (e) => {
    if (e.key === 'Escape') {
      cerrarModal(idModal);
    }
    gestionarFocusTrap(e, modal);
  };

  // Click en el overlay (fondo oscuro) para cerrar
  const handlerClickOverlay = (e) => {
    if (e.target === modal) {
      cerrarModal(idModal);
    }
  };

  // Almacenar handlers para limpieza posterior
  modal._handlerKeydown = handlerKeydown;
  modal._handlerClickOverlay = handlerClickOverlay;

  document.addEventListener('keydown', handlerKeydown);
  modal.addEventListener('click', handlerClickOverlay);
}

/**
 * Cierra un modal identificado por su ID.
 * Restaura el foco al elemento que lo tenía antes de abrir.
 *
 * @param {string} idModal - ID del elemento modal en el DOM.
 *
 * @example
 *   cerrarModal('modal-tarea');
 */
export function cerrarModal(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) return;

  // Ocultar modal
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Limpiar listeners
  if (modal._handlerKeydown) {
    document.removeEventListener('keydown', modal._handlerKeydown);
    delete modal._handlerKeydown;
  }
  if (modal._handlerClickOverlay) {
    modal.removeEventListener('click', modal._handlerClickOverlay);
    delete modal._handlerClickOverlay;
  }

  // Restaurar foco al elemento previo
  if (_elementoFocoPrevio && typeof _elementoFocoPrevio.focus === 'function') {
    _elementoFocoPrevio.focus();
    _elementoFocoPrevio = null;
  }
}

// ─────────────────────────────────────────────
// 4. MODAL DE CONFIRMACIÓN
// ─────────────────────────────────────────────

/**
 * Muestra un modal de confirmación y retorna una Promise.
 * Resuelve `true` si el usuario acepta, `false` si cancela.
 *
 * @param {string} mensaje - Texto de la pregunta de confirmación.
 * @returns {Promise<boolean>} Resultado de la decisión del usuario.
 *
 * @example
 *   const aceptado = await confirmar('¿Estás seguro de eliminar esta tarea?');
 *   if (aceptado) {
 *     // Proceder con la eliminación
 *   }
 */
export function confirmar(mensaje) {
  return new Promise((resolve) => {
    // Crear modal de confirmación dinámicamente
    const overlay = document.createElement('div');
    overlay.id = 'modal-confirmar';
    overlay.className = `
      fixed inset-0 z-[9998] flex items-center justify-center
      bg-black/60 backdrop-blur-sm
      transition-opacity duration-300
    `.trim();
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'confirmar-titulo');

    overlay.innerHTML = `
      <div class="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 mx-4
                  w-full max-w-md shadow-2xl shadow-black/40
                  transform scale-95 opacity-0 transition-all duration-300"
           id="confirmar-contenido">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M10.29 3.86l-8.58 14.86A1 1 0 002.59 20h18.82a1 1 0 00.87-1.28L13.71 3.86a1 1 0 00-1.42 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 id="confirmar-titulo" class="text-lg font-semibold text-white mb-1">Confirmar acción</h3>
            <p class="text-slate-300 text-sm">${mensaje}</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button id="btn-confirmar-cancelar"
                  class="px-4 py-2 text-sm font-medium rounded-xl
                         bg-slate-700 text-slate-300 hover:bg-slate-600
                         border border-slate-600/50
                         transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-slate-500">
            Cancelar
          </button>
          <button id="btn-confirmar-aceptar"
                  class="px-4 py-2 text-sm font-medium rounded-xl
                         bg-rose-600 text-white hover:bg-rose-500
                         border border-rose-500/50
                         transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-rose-400">
            Eliminar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Animar entrada
    requestAnimationFrame(() => {
      const contenido = overlay.querySelector('#confirmar-contenido');
      contenido.classList.remove('scale-95', 'opacity-0');
      contenido.classList.add('scale-100', 'opacity-100');
    });

    // Foco en el botón cancelar por seguridad
    const btnCancelar = overlay.querySelector('#btn-confirmar-cancelar');
    const btnAceptar = overlay.querySelector('#btn-confirmar-aceptar');
    requestAnimationFrame(() => btnCancelar.focus());

    /** Limpia el modal de confirmación */
    const limpiar = (resultado) => {
      const contenido = overlay.querySelector('#confirmar-contenido');
      contenido.classList.add('scale-95', 'opacity-0');

      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        resolve(resultado);
      }, 200);
    };

    btnCancelar.addEventListener('click', () => limpiar(false));
    btnAceptar.addEventListener('click', () => limpiar(true));

    // Cerrar con Escape = cancelar
    const handlerEsc = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handlerEsc);
        limpiar(false);
      }
    };
    document.addEventListener('keydown', handlerEsc);

    // Click en overlay = cancelar
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) limpiar(false);
    });
  });
}
