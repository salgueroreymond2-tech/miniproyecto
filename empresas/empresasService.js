import { request } from '../src/services/api.js';

const ENDPOINT_EMPRESAS = '/empresas';

/**
 * Obtiene el listado completo de empresas desde la API.
 * @returns {Promise<Array<object>>}
 */
export async function obtenerEmpresas() {
  return await request(ENDPOINT_EMPRESAS, 'GET');
}

/**
 * Obtiene los detalles de una empresa específica por su identificador.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function obtenerEmpresaPorId(id) {
  return await request(`${ENDPOINT_EMPRESAS}/${id}`, 'GET');
}

/**
 * Registra una nueva empresa en el servidor.
 * @param {object} datosEmpresa
 * @returns {Promise<object>}
 */
export async function crearEmpresa(datosEmpresa) {
  return await request(ENDPOINT_EMPRESAS, 'POST', datosEmpresa);
}

/**
 * Actualiza los datos de una empresa existente.
 * @param {string|number} id
 * @param {object} datosEmpresa
 * @returns {Promise<object>}
 */
export async function actualizarEmpresa(id, datosEmpresa) {
  return await request(`${ENDPOINT_EMPRESAS}/${id}`, 'PUT', datosEmpresa);
}

/**
 * Elimina una empresa del servidor por su identificador.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function eliminarEmpresaPorId(id) {
  return await request(`${ENDPOINT_EMPRESAS}/${id}`, 'DELETE');
}
