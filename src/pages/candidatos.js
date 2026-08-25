const BASE_URL = 'http://localhost:3000/candidatos';
const tablaDOM = document.getElementById('tablaCandidatos');
let listaCandidatosMemoria = [];

// ==========================================
// SERVICIO HTTP FETCH
// ==========================================
async function apiService(endpoint = '', method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (res.status === 204) return { success: true };
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
  return await res.json();
}

// ==========================================
// RENDERIZADO Y MANIPULACIÓN DEL DOM
// ==========================================
function crearFilaCandidato(c) {
  const tr = document.createElement('tr');
  tr.setAttribute('data-id', c.id);

  tr.innerHTML = `
    <td>${c.id}</td>
    <td>
      <strong>${escaparHTML(c.nombre)}</strong><br>
      <small>${escaparHTML(c.email)} | ${escaparHTML(c.telefono)}</small>
    </td>
    <td>${escaparHTML(c.puestoDeseado)}<br><small>Exp: ${c.experiencia} año(s)</small></td>
    <td>${escaparHTML(c.modalidad)}</td>
    <td>$${c.expectativaSalarial}</td>
    <td>${escaparHTML(c.habilidades)}</td>
    <td><a href="${escaparHTML(c.linkCv)}" target="_blank" rel="noopener">Ver CV</a></td>
    <td>
      <select class="select-estado" onchange="ejecutarPATCH('${c.id}', this.value)">
        <option value="Postulado" ${c.estado === 'Postulado' ? 'selected' : ''}>Postulado</option>
        <option value="En Revisión" ${c.estado === 'En Revisión' ? 'selected' : ''}>En Revisión</option>
        <option value="Entrevista Técnica" ${c.estado === 'Entrevista Técnica' ? 'selected' : ''}>Entrevista Técnica</option>
        <option value="Contratado" ${c.estado === 'Contratado' ? 'selected' : ''}>Contratado</option>
        <option value="Descartado" ${c.estado === 'Descartado' ? 'selected' : ''}>Descartado</option>
      </select>
    </td>
    <td>
      <div class="btn-group">
        <button class="btn btn-edit" onclick="prepararPUT('${c.id}')">Editar (PUT)</button>
        <button class="btn btn-danger" onclick="ejecutarDELETE('${c.id}')">Eliminar (DELETE)</button>
      </div>
    </td>
  `;
  return tr;
}

function renderizarTabla(lista) {
  tablaDOM.innerHTML = '';
  lista.forEach(c => tablaDOM.appendChild(crearFilaCandidato(c)));
}

// ==========================================
// OPERACIONES HTTP
// ==========================================

// 1. GET
async function ejecutarGET() {
  try {
    listaCandidatosMemoria = await apiService();
    renderizarTabla(listaCandidatosMemoria);
  } catch (err) {
    console.error('Error al cargar datos:', err);
  }
}

// 2. POST
async function ejecutarPOST(candidatoData) {
  try {
    const creado = await apiService('', 'POST', candidatoData);
    listaCandidatosMemoria.push(creado);
    tablaDOM.appendChild(crearFilaCandidato(creado)); // Agregado directo al árbol DOM
    cerrarModal('modalCrear');
  } catch (err) {
    alert('Error al registrar la postulación.');
  }
}

// 3. PUT
async function ejecutarPUT(id, candidatoData) {
  try {
    const actualizado = await apiService(`/${id}`, 'PUT', candidatoData);
    const index = listaCandidatosMemoria.findIndex(c => c.id === id);
    if (index !== -1) listaCandidatosMemoria[index] = actualizado;

    // Reemplaza el nodo viejo en el DOM
    const nodoViejo = tablaDOM.querySelector(`[data-id="${id}"]`);
    if (nodoViejo) {
      tablaDOM.replaceChild(crearFilaCandidato(actualizado), nodoViejo);
    }
    cerrarModal('modalEditar');
  } catch (err) {
    alert('Error al actualizar el expediente.');
  }
}

// 4. PATCH
async function ejecutarPATCH(id, nuevoEstado) {
  try {
    await apiService(`/${id}`, 'PATCH', { estado: nuevoEstado });
    const candidato = listaCandidatosMemoria.find(c => c.id === id);
    if (candidato) candidato.estado = nuevoEstado;
  } catch (err) {
    alert('Error al actualizar el estado.');
  }
}

// 5. DELETE
async function ejecutarDELETE(id) {
  if (!confirm('¿Deseas eliminar este registro de postulación?')) return;
  try {
    await apiService(`/${id}`, 'DELETE');
    listaCandidatosMemoria = listaCandidatosMemoria.filter(c => c.id !== id);

    // Remueve el nodo del DOM
    const nodoAEliminar = tablaDOM.querySelector(`[data-id="${id}"]`);
    if (nodoAEliminar) tablaDOM.removeChild(nodoAEliminar);
  } catch (err) {
    alert('Error al eliminar el registro.');
  }
}

// ==========================================
// EVENTOS Y UTILIDADES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  ejecutarGET();

  document.getElementById('btnAbrirCrear').addEventListener('click', () => {
    document.getElementById('formCrear').reset();
    abrirModal('modalCrear');
  });

  document.getElementById('formCrear').addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = obtenerDatosFormulario('crear');
    ejecutarPOST(datos);
  });

  document.getElementById('formEditar').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editarId').value;
    const datos = obtenerDatosFormulario('editar');
    ejecutarPUT(id, datos);
  });

  document.getElementById('inputBuscar').addEventListener('input', (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filtrados = listaCandidatosMemoria.filter(c =>
      c.nombre.toLowerCase().includes(busqueda) ||
      c.puestoDeseado.toLowerCase().includes(busqueda) ||
      c.habilidades.toLowerCase().includes(busqueda)
    );
    renderizarTabla(filtrados);
  });
});

function obtenerDatosFormulario(prefix) {
  return {
    nombre: document.getElementById(`${prefix}Nombre`).value,
    email: document.getElementById(`${prefix}Email`).value,
    telefono: document.getElementById(`${prefix}Telefono`).value,
    puestoDeseado: document.getElementById(`${prefix}Puesto`).value,
    experiencia: Number(document.getElementById(`${prefix}Experiencia`).value),
    modalidad: document.getElementById(`${prefix}Modalidad`).value,
    expectativaSalarial: Number(document.getElementById(`${prefix}Sueldo`).value),
    habilidades: document.getElementById(`${prefix}Habilidades`).value,
    linkCv: document.getElementById(`${prefix}Cv`).value,
    estado: document.getElementById(`${prefix}Estado`).value
  };
}

function prepararPUT(id) {
  const c = listaCandidatosMemoria.find(cand => cand.id === id);
  if (!c) return;

  document.getElementById('editarId').value = c.id;
  document.getElementById('editarNombre').value = c.nombre;
  document.getElementById('editarEmail').value = c.email;
  document.getElementById('editarTelefono').value = c.telefono;
  document.getElementById('editarPuesto').value = c.puestoDeseado;
  document.getElementById('editarExperiencia').value = c.experiencia;
  document.getElementById('editarModalidad').value = c.modalidad;
  document.getElementById('editarSueldo').value = c.expectativaSalarial;
  document.getElementById('editarHabilidades').value = c.habilidades;
  document.getElementById('editarCv').value = c.linkCv;
  document.getElementById('editarEstado').value = c.estado;

  abrirModal('modalEditar');
}

function abrirModal(id) { document.getElementById(id).classList.add('active'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('active'); }

function escaparHTML(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}