import { request } from '../src/services/api.js';

const ENDPOINT_VACANTES = '/vacantes';

/**
 * Obtiene el listado completo de vacantes desde la API.
 * @returns {Promise<Array<object>>}
 */
export async function obtenerVacantes() {
  return await request(ENDPOINT_VACANTES, 'GET');
}

/**
 * Obtiene los detalles de una vacante específica por su identificador.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function obtenerVacantePorId(id) {
  return await request(`${ENDPOINT_VACANTES}/${id}`, 'GET');
}

/**
 * Registra una nueva vacante en el servidor.
 * @param {object} datosVacante
 * @returns {Promise<object>}
 */
export async function crearVacante(datosVacante) {
  return await request(ENDPOINT_VACANTES, 'POST', datosVacante);
}

/**
 * Actualiza los datos de una vacante existente.
 * @param {string|number} id
 * @param {object} datosVacante
 * @returns {Promise<object>}
 */
export async function actualizarVacante(id, datosVacante) {
  return await request(`${ENDPOINT_VACANTES}/${id}`, 'PUT', datosVacante);
}

/**
 * Elimina una vacante del servidor por su identificador.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function eliminarVacantePorId(id) {
  return await request(`${ENDPOINT_VACANTES}/${id}`, 'DELETE');
}
