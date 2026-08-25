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
