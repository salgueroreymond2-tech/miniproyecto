// ===============================
// API SERVICE (self-contained)
// ===============================
const API_URL = "http://localhost:3000";

async function obtenerDatos(recurso) {
  const respuesta = await fetch(`${API_URL}/${recurso}`);
  if (!respuesta.ok) throw new Error(`Error al obtener ${recurso}`);
  return await respuesta.json();
}

async function crearDato(recurso, datos) {
  const respuesta = await fetch(`${API_URL}/${recurso}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) throw new Error(`Error al crear ${recurso}`);
  return await respuesta.json();
}

async function actualizarDato(recurso, id, datos) {
  const respuesta = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) throw new Error(`Error al actualizar ${recurso}`);
  return await respuesta.json();
}

async function eliminarDato(recurso, id) {
  const respuesta = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "DELETE"
  });
  if (!respuesta.ok) throw new Error(`Error al eliminar ${recurso}`);
  return true;
}

// ======================================
// DATOS EN MEMORIA / FALLBACK
// ======================================
let candidatos = [];
let vacantes = [];
let postulaciones = [];
let entrevistas = [];
let usarFallback = false;

const entrevistasPreCargadas = [
  { id: "1", postulacionId: "2", candidatoId: "2", vacanteId: "2", fecha: "2026-08-28", hora: "09:00", resultado: "Pendiente", notas: "Primera entrevista con recursos humanos. Revisar portafolio de diseño." },
  { id: "2", postulacionId: "4", candidatoId: "4", vacanteId: "4", fecha: "2026-08-29", hora: "14:00", resultado: "Aprobado", notas: "Excelente experiencia en React y Node.js. Candidato fuerte para el equipo." },
  { id: "3", postulacionId: "1", candidatoId: "1", vacanteId: "1", fecha: "2026-08-25", hora: "11:00", resultado: "Aprobado", notas: "Buen manejo de CSS y JavaScript. Contratado para el equipo de frontend." }
];

// ======================================
// INICIO
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  const form = document.getElementById("formEntrevista");
  if (form) {
    form.addEventListener("submit", crearEntrevista);
  }
});

// ======================================
// CARGAR DATOS
// ======================================
async function cargarDatos() {
  try {
    candidatos = await obtenerDatos("candidatos");
    vacantes = await obtenerDatos("vacantes");
    postulaciones = await obtenerDatos("postulaciones");
    entrevistas = await obtenerDatos("entrevistas");
  } catch (error) {
    console.warn("API no disponible, usando fallback:", error.message);
    usarFallback = true;
    entrevistas = [...entrevistasPreCargadas];
  }

  cargarSelectPostulaciones();
  mostrarEntrevistas();
}

function cargarSelectPostulaciones() {
  const select = document.getElementById("postulacion");
  if (!select) return;
  select.innerHTML = '<option value="">Seleccione una postulación</option>';

  postulaciones.forEach(postulacion => {
    const candidato = candidatos.find(c => String(c.id) === String(postulacion.candidatoId));
    const vacante = vacantes.find(v => String(v.id) === String(postulacion.vacanteId));
    const option = document.createElement("option");
    option.value = postulacion.id;
    option.textContent = `${candidato?.nombre || "Candidato"} - ${vacante?.titulo || "Vacante"}`;
    select.appendChild(option);
  });
}

function mostrarEntrevistas() {
  const tabla = document.getElementById("tablaEntrevistas");
  if (!tabla) return;
  tabla.innerHTML = "";

  entrevistas.forEach(entrevista => {
    const candidato = candidatos.find(c => String(c.id) === String(entrevista.candidatoId));
    const vacante = vacantes.find(v => String(v.id) === String(entrevista.vacanteId));
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${entrevista.id}</td>
      <td>${candidato?.nombre || "No encontrado"}</td>
      <td>${candidato?.email || "-"}</td>
      <td>${vacante?.titulo || "No encontrada"}</td>
      <td>${vacante?.empresa || "-"}</td>
      <td>${vacante?.ubicacion || "-"}</td>
      <td>${entrevista.fecha}</td>
      <td>${entrevista.hora}</td>
      <td>
        <select onchange="cambiarResultado(${entrevista.id}, this.value)">
          <option value="Pendiente" ${entrevista.resultado === "Pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="Aprobado" ${entrevista.resultado === "Aprobado" ? "selected" : ""}>Aprobado</option>
          <option value="Rechazado" ${entrevista.resultado === "Rechazado" ? "selected" : ""}>Rechazado</option>
        </select>
      </td>
      <td><span class="notas">${entrevista.notas || "Sin notas"}</span></td>
      <td class="table-actions">
        <button class="btn btn-edit" onclick="editarNotas(${entrevista.id})">Editar</button>
        <button class="btn btn-delete" onclick="eliminarEntrevista(${entrevista.id})">Eliminar</button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

async function crearEntrevista(event) {
  event.preventDefault();
  const postulacionId = document.getElementById("postulacion").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const resultado = document.getElementById("resultado").value;
  const notas = document.getElementById("notas").value;

  const postulacion = postulaciones.find(p => String(p.id) === String(postulacionId));
  if (!postulacion) {
    alert("No se encontró la postulación seleccionada.");
    return;
  }

  const nuevaEntrevista = {
    postulacionId: postulacion.id,
    candidatoId: postulacion.candidatoId,
    vacanteId: postulacion.vacanteId,
    fecha,
    hora,
    resultado,
    notas
  };

  if (usarFallback) {
    nuevaEntrevista.id = String(
      entrevistas.length > 0 ? Math.max(...entrevistas.map(e => Number(e.id))) + 1 : 1
    );
    entrevistas.push(nuevaEntrevista);
    alert("Entrevista registrada correctamente.");
    document.getElementById("formEntrevista").reset();
    mostrarEntrevistas();
    return;
  }

  try {
    await crearDato("entrevistas", nuevaEntrevista);
    await actualizarDato("postulaciones", postulacion.id, { estado: "Entrevista" });
    alert("Entrevista registrada correctamente.");
    document.getElementById("formEntrevista").reset();
    cargarDatos();
  } catch (error) {
    console.error(error);
    alert("No se pudo registrar la entrevista.");
  }
}

window.cambiarResultado = async function(id, nuevoResultado) {
  if (usarFallback) {
    const entrevista = entrevistas.find(e => Number(e.id) === Number(id));
    if (entrevista) entrevista.resultado = nuevoResultado;
    alert("Resultado actualizado correctamente.");
    return;
  }

  try {
    await actualizarDato("entrevistas", id, { resultado: nuevoResultado });
    alert("Resultado actualizado correctamente.");
    cargarDatos();
  } catch (error) {
    console.error(error);
    alert("No se pudo actualizar el resultado.");
  }
};

window.editarNotas = async function(id) {
  const entrevista = entrevistas.find(e => String(e.id) === String(id));
  if (!entrevista) {
    alert("No se encontró la entrevista.");
    return;
  }

  const nuevasNotas = prompt("Escriba las nuevas notas de la entrevista:", entrevista.notas || "");
  if (nuevasNotas === null) return;

  if (usarFallback) {
    entrevista.notas = nuevasNotas;
    alert("Notas actualizadas correctamente.");
    mostrarEntrevistas();
    return;
  }

  try {
    await actualizarDato("entrevistas", id, { notas: nuevasNotas });
    alert("Notas actualizadas correctamente.");
    cargarDatos();
  } catch (error) {
    console.error(error);
    alert("No se pudieron actualizar las notas.");
  }
};

window.eliminarEntrevista = async function(id) {
  const confirmar = confirm("¿Está seguro de eliminar esta entrevista?");
  if (!confirmar) return;

  if (usarFallback) {
    entrevistas = entrevistas.filter(e => Number(e.id) !== Number(id));
    alert("Entrevista eliminada correctamente.");
    mostrarEntrevistas();
    return;
  }

  try {
    await eliminarDato("entrevistas", id);
    alert("Entrevista eliminada correctamente.");
    cargarDatos();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la entrevista.");
  }
};
