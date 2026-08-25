const API_URL = 'http://localhost:3000/candidatos';

let candidatos = [];

const CANDIDATOS_INICIALES = [
  { id: '1', nombre: 'Ana García', email: 'ana@example.com', telefono: '8888-1111', puestoDeseado: 'Frontend Dev', estado: 'En Proceso', fechaPostulacion: '2026-08-20' },
  { id: '2', nombre: 'Carlos Ruiz', email: 'carlos@example.com', telefono: '8888-2222', puestoDeseado: 'QA Tester', estado: 'Nuevo', fechaPostulacion: '2026-08-22' }
];

document.addEventListener('DOMContentLoaded', () => {
  obtenerCandidatos();
  configurarEventos();
});

// 1. GET - Obtener todos los candidatos
async function obtenerCandidatos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Servidor no disponible');
    candidatos = await res.json();
  } catch (error) {
    const localData = localStorage.getItem('candidatos_local');
    candidatos = localData ? JSON.parse(localData) : CANDIDATOS_INICIALES;
    guardarEnLocalStorage();
  }
  renderizarTabla(candidatos);
}

// 2. POST - Crear candidato
async function crearCandidato(nuevoCandidato) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCandidato)
    });
    if (!res.ok) throw new Error('Error al crear');
    const creado = await res.json();
    candidatos.push(creado);
  } catch (error) {
    nuevoCandidato.id = Date.now().toString();
    candidatos.push(nuevoCandidato);
    guardarEnLocalStorage();
  }
  renderizarTabla(candidatos);
  cerrarModal('modalCrear');
}

// 3. PUT - Reemplazo/Actualización completa
async function actualizarCandidato(id, candidatoActualizado) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidatoActualizado)
    });
    if (!res.ok) throw new Error('Error al actualizar');
    const index = candidatos.findIndex(c => c.id === id);
    if (index !== -1) candidatos[index] = await res.json();
  } catch (error) {
    const index = candidatos.findIndex(c => c.id === id);
    if (index !== -1) {
      candidatos[index] = { ...candidatoActualizado, id };
      guardarEnLocalStorage();
    }
  }
  renderizarTabla(candidatos);
  cerrarModal('modalEditar');
}

// 4. PATCH - Actualización parcial (Solo el estado)
async function cambiarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error('Error al cambiar estado');
    const index = candidatos.findIndex(c => c.id === id);
    if (index !== -1) candidatos[index].estado = nuevoEstado;
  } catch (error) {
    const index = candidatos.findIndex(c => c.id === id);
    if (index !== -1) {
      candidatos[index].estado = nuevoEstado;
      guardarEnLocalStorage();
    }
  }
  renderizarTabla(candidatos);
}

// 5. DELETE - Eliminar candidato
async function eliminarCandidato(id) {
  if (!confirm('¿Seguro que deseas eliminar este candidato?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    candidatos = candidatos.filter(c => c.id !== id);
  } catch (error) {
    candidatos = candidatos.filter(c => c.id !== id);
    guardarEnLocalStorage();
  }
  renderizarTabla(candidatos);
}

// Renderizado de UI
function renderizarTabla(lista) {
  const tbody = document.getElementById('tablaCandidatos');
  tbody.innerHTML = '';

  lista.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td><strong>${escaparHTML(c.nombre)}</strong></td>
      <td>${escaparHTML(c.email)}<br><small>${escaparHTML(c.telefono)}</small></td>
      <td>${escaparHTML(c.puestoDeseado)}</td>
      <td>
        <select class="select-estado" onchange="cambiarEstado('${c.id}', this.value)">
          <option value="Nuevo" ${c.estado === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
          <option value="En Proceso" ${c.estado === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
          <option value="Entrevistado" ${c.estado === 'Entrevistado' ? 'selected' : ''}>Entrevistado</option>
          <option value="Contratado" ${c.estado === 'Contratado' ? 'selected' : ''}>Contratado</option>
          <option value="Rechazado" ${c.estado === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
        </select>
      </td>
      <td>${c.fechaPostulacion}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-edit" onclick="abrirModalEditar('${c.id}')">Editar (PUT)</button>
          <button class="btn btn-danger" onclick="eliminarCandidato('${c.id}')">Eliminar (DELETE)</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function configurarEventos() {
  document.getElementById('btnAbrirCrear').addEventListener('click', () => {
    document.getElementById('formCrear').reset();
    abrirModal('modalCrear');
  });

  document.getElementById('formCrear').addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevo = {
      nombre: document.getElementById('crearNombre').value,
      email: document.getElementById('crearEmail').value,
      telefono: document.getElementById('crearTelefono').value,
      puestoDeseado: document.getElementById('crearPuesto').value,
      estado: document.getElementById('crearEstado').value,
      fechaPostulacion: new Date().toISOString().split('T')[0]
    };
    crearCandidato(nuevo);
  });

  document.getElementById('formEditar').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editarId').value;
    const actualizado = {
      nombre: document.getElementById('editarNombre').value,
      email: document.getElementById('editarEmail').value,
      telefono: document.getElementById('editarTelefono').value,
      puestoDeseado: document.getElementById('editarPuesto').value,
      estado: document.getElementById('editarEstado').value,
      fechaPostulacion: candidatos.find(c => c.id === id)?.fechaPostulacion || new Date().toISOString().split('T')[0]
    };
    actualizarCandidato(id, actualizado);
  });

  document.getElementById('inputBuscar').addEventListener('input', (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filtrados = candidatos.filter(c => 
      c.nombre.toLowerCase().includes(busqueda) || 
      c.puestoDeseado.toLowerCase().includes(busqueda)
    );
    renderizarTabla(filtrados);
  });
}

function abrirModal(id) { document.getElementById(id).classList.add('active'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('active'); }

function abrirModalEditar(id) {
  const candidato = candidatos.find(c => c.id === id);
  if (!candidato) return;

  document.getElementById('editarId').value = candidato.id;
  document.getElementById('editarNombre').value = candidato.nombre;
  document.getElementById('editarEmail').value = candidato.email;
  document.getElementById('editarTelefono').value = candidato.telefono;
  document.getElementById('editarPuesto').value = candidato.puestoDeseado;
  document.getElementById('editarEstado').value = candidato.estado;

  abrirModal('modalEditar');
}

function guardarEnLocalStorage() {
  localStorage.setItem('candidatos_local', JSON.stringify(candidatos));
}

function escaparHTML(str) {
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}