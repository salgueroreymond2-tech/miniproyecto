import { request } from './api.js';

const ENDPOINT_EMPRESAS = '/empresas';

/**
 * Obtiene el listado completo de empresas desde la API.
 *
 * @returns {Promise<Array<object>>} Promesa con la lista de empresas.
 */
export async function obtenerEmpresas() {
  return await request(ENDPOINT_EMPRESAS, 'GET');
}

/**
 * Obtiene los detalles de una empresa específica por su identificador.
 *
 * @param {string|number} id - Identificador único de la empresa.
 * @returns {Promise<object>} Promesa con los datos de la empresa.
 */
export async function obtenerEmpresaPorId(id) {
  return await request(`${ENDPOINT_EMPRESAS}/${id}`, 'GET');
}

/**
 * Registra una nueva empresa en el servidor.
 *
 * @param {object} datosEmpresa - Objeto con los datos de la empresa.
 * @returns {Promise<object>} Promesa con la empresa creada.
 */
export async function crearEmpresa(datosEmpresa) {
  return await request(ENDPOINT_EMPRESAS, 'POST', datosEmpresa);
}

/**
 * Actualiza los datos de una empresa existente.
 *
 * @param {string|number} id - Identificador único de la empresa a actualizar.
 * @param {object} datosEmpresa - Objeto con los datos modificados.
 * @returns {Promise<object>} Promesa con la empresa actualizada.
 */
export async function actualizarEmpresa(id, datosEmpresa) {
  return await request(`${ENDPOINT_EMPRESAS}/${id}`, 'PUT', datosEmpresa);
}

/**
 * Elimina una empresa del servidor por su identificador.
 *
 * @param {string|number} id - Identificador único de la empresa a eliminar.
 * @returns {Promise<object>} Promesa con la respuesta del servidor.
 */
export async function eliminarEmpresaPorId(id) {
  return await request(`${ENDPOINT_EMPRESAS}/${id}`, 'DELETE');
}
