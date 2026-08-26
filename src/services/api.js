const BASE_URL = 'http://localhost:3000';
const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];
const HTTP_ERROR_STATUS_THRESHOLD = 400;

/**
 * Realiza peticiones HTTP asíncronas a la API base.
 *
 * @param {string} endpoint - Ruta del recurso (ejemplo: '/usuarios').
 * @param {string} [method='GET'] - Método HTTP de la petición.
 * @param {object|null} [body=null] - Datos a enviar en el cuerpo de la petición.
 * @returns {Promise<any>} Respuesta del servidor parseada en formato JSON.
 */
export async function request(endpoint, method = 'GET', body = null) {
  const normalizedMethod = method.toUpperCase();
  const requestUrl = `${BASE_URL}${endpoint}`;

  const requestOptions = {
    method: normalizedMethod,
    headers: {},
  };

  if (METHODS_WITH_BODY.includes(normalizedMethod) && body !== null) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(requestUrl, requestOptions);

    if (response.status >= HTTP_ERROR_STATUS_THRESHOLD || !response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage =
        errorBody?.message ||
        `Error HTTP ${response.status}: ${response.statusText || 'Petición no exitosa'}`;

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en la petición a ${requestUrl}:`, error.message);
    throw error;
  }
}

/**
 * Muestra una notificación Toast moderna y flotante sin bloquear la interfaz.
 * @param {string} mensaje 
 * @param {'success'|'error'|'info'} tipo 
 */
export function mostrarToast(mensaje, tipo = 'success') {
  let container = document.getElementById('jc-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'jc-toast-container';
    document.body.appendChild(container);
  }

  const iconName = tipo === 'success' ? 'check_circle' : tipo === 'error' ? 'error' : 'info';

  const toast = document.createElement('div');
  toast.className = `jc-toast ${tipo}`;
  toast.innerHTML = `
    <span class="material-symbols-rounded jc-toast-icon">${iconName}</span>
    <span>${mensaje}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

/**
 * Muestra un diálogo modal de confirmación con diseño SaaS oscuro.
 * @param {string} titulo 
 * @param {string} mensaje 
 * @param {Function} onConfirmar 
 */
export function confirmarAccion(titulo, mensaje, onConfirmar) {
  const overlay = document.createElement('div');
  overlay.className = 'jc-modal-overlay';
  overlay.innerHTML = `
    <div class="jc-modal-box">
      <div class="jc-modal-header">
        <span class="material-symbols-rounded" style="color: #EF4444; font-size: 26px;">warning</span>
        <h3 class="jc-modal-title">${titulo}</h3>
      </div>
      <p class="jc-modal-body">${mensaje}</p>
      <div class="jc-modal-actions">
        <button type="button" class="btn btn-secondary" id="btn-cancelar-modal">Cancelar</button>
        <button type="button" class="btn btn-danger" id="btn-confirmar-modal">Confirmar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnCancelar = overlay.querySelector('#btn-cancelar-modal');
  const btnConfirmar = overlay.querySelector('#btn-confirmar-modal');

  btnCancelar.addEventListener('click', () => overlay.remove());
  btnConfirmar.addEventListener('click', () => {
    overlay.remove();
    onConfirmar();
  });
}

