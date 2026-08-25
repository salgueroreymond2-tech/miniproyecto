import { request } from './api.js';

const ENDPOINT_VACANTES = '/vacantes';

/**
 * Obtiene el listado completo de vacantes desde la API.
 *
 * @returns {Promise<Array<object>>} Promesa con la lista de vacantes.
 */
export async function obtenerVacantes() {
  return await request(ENDPOINT_VACANTES, 'GET');
}

/**
 * Obtiene los detalles de una vacante específica por su identificador.
 *
 * @param {string|number} id - Identificador único de la vacante.
 * @returns {Promise<object>} Promesa con los datos de la vacante.
 */
export async function obtenerVacantePorId(id) {
  return await request(`${ENDPOINT_VACANTES}/${id}`, 'GET');
}

/**
 * Registra una nueva vacante en el servidor.
 *
 * @param {object} datosVacante - Objeto con los datos de la vacante.
 * @returns {Promise<object>} Promesa con la vacante creada.
 */
export async function crearVacante(datosVacante) {
  return await request(ENDPOINT_VACANTES, 'POST', datosVacante);
}

/**
 * Actualiza los datos de una vacante existente.
 *
 * @param {string|number} id - Identificador único de la vacante a actualizar.
 * @param {object} datosVacante - Objeto con los datos modificados.
 * @returns {Promise<object>} Promesa con la vacante actualizada.
 */
export async function actualizarVacante(id, datosVacante) {
  return await request(`${ENDPOINT_VACANTES}/${id}`, 'PUT', datosVacante);
}

/**
 * Elimina una vacante del servidor por su identificador.
 *
 * @param {string|number} id - Identificador único de la vacante a eliminar.
 * @returns {Promise<object>} Promesa con la respuesta del servidor.
 */
export async function eliminarVacantePorId(id) {
  return await request(`${ENDPOINT_VACANTES}/${id}`, 'DELETE');
}
