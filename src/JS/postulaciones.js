// ===============================
// DATOS PRE-CARGADOS (fallback)
// ===============================

const candidatosPreCargados = [
    { id: "1", nombre: "Bryan Gomez", email: "bryan@gmail.com", telefono: "8888-8888", profesion: "Desarrollador Web" },
    { id: "2", nombre: "María Rodríguez", email: "maria@gmail.com", telefono: "8777-7777", profesion: "Diseñadora UX/UI" },
    { id: "3", nombre: "Carlos Pérez", email: "carlos@gmail.com", telefono: "8666-6666", profesion: "Analista de Datos" },
    { id: "4", nombre: "Laura Fernández", email: "laura@gmail.com", telefono: "8555-5555", profesion: "Desarrolladora Full Stack" },
    { id: "5", nombre: "Andrés Castillo", email: "andres@gmail.com", telefono: "8444-4444", profesion: "Ingeniero de Software" },
    { id: "6", nombre: "Sofía Mora", email: "sofia@gmail.com", telefono: "8333-3333", profesion: "Project Manager" },
    { id: "7", nombre: "Daniel Rojas", email: "daniel@gmail.com", telefono: "8222-2222", profesion: "Desarrollador Backend" },
    { id: "8", nombre: "Valentina Campos", email: "valentina@gmail.com", telefono: "8111-1111", profesion: "Ingeniera de QA" }
];

const vacantesPreCargadas = [
    { id: "1", titulo: "Desarrollador Frontend", empresa: "Tech Solutions", ubicacion: "San José", estado: "Activa" },
    { id: "2", titulo: "Diseñador UX/UI", empresa: "Digital Corp", ubicacion: "Heredia", estado: "Activa" },
    { id: "3", titulo: "Analista de Datos", empresa: "Data CR", ubicacion: "Alajuela", estado: "Activa" },
    { id: "4", titulo: "Desarrollador Full Stack", empresa: "Tech Solutions", ubicacion: "San José", estado: "Activa" },
    { id: "5", titulo: "Ingeniero DevOps", empresa: "Cloud Systems", ubicacion: "Cartago", estado: "Cerrada" },
    { id: "6", titulo: "Ingeniero de QA", empresa: "QualitySoft", ubicacion: "Limón", estado: "Activa" },
    { id: "7", titulo: "Desarrollador Backend", empresa: "CodeHouse", ubicacion: "Remoto", estado: "Activa" },
    { id: "8", titulo: "Gerente de Producto", empresa: "InnovateCR", ubicacion: "San José", estado: "Activa" },
    { id: "9", titulo: "Ingeniero de Ciberseguridad", empresa: "SecureNet", ubicacion: "Heredia", estado: "Activa" },
    { id: "10", titulo: "Analista de Marketing Digital", empresa: "MediaBoost", ubicacion: "Alajuela", estado: "Activa" },
    { id: "11", titulo: "Administrador de Bases de Datos", empresa: "DataCR", ubicacion: "Cartago", estado: "Activa" },
    { id: "12", titulo: "Desarrollador Móvil", empresa: "AppWorks", ubicacion: "Remoto", estado: "Activa" }
];

const postulacionesPreCargadas = [
    { id: "1", candidatoId: "1", vacanteId: "1", fecha: "2026-08-15", estado: "Seleccionado" },
    { id: "2", candidatoId: "2", vacanteId: "2", fecha: "2026-08-16", estado: "Entrevista" },
    { id: "3", candidatoId: "3", vacanteId: "3", fecha: "2026-08-17", estado: "En revisión" },
    { id: "4", candidatoId: "4", vacanteId: "4", fecha: "2026-08-18", estado: "Entrevista" },
    { id: "5", candidatoId: "5", vacanteId: "1", fecha: "2026-08-19", estado: "Rechazado" },
    { id: "6", candidatoId: "6", vacanteId: "4", fecha: "2026-08-20", estado: "En revisión" },
    { id: "7", candidatoId: "1", vacanteId: "4", fecha: "2026-08-21", estado: "Entrevista" },
    { id: "8", candidatoId: "3", vacanteId: "2", fecha: "2026-08-22", estado: "Rechazado" },
    { id: "9", candidatoId: "7", vacanteId: "4", fecha: "2026-08-23", estado: "En revisión" },
    { id: "10", candidatoId: "8", vacanteId: "6", fecha: "2026-08-24", estado: "Entrevista" },
    { id: "11", candidatoId: "5", vacanteId: "3", fecha: "2026-08-25", estado: "En revisión" },
    { id: "12", candidatoId: "2", vacanteId: "1", fecha: "2026-08-26", estado: "Seleccionado" },
    { id: "13", candidatoId: "6", vacanteId: "3", fecha: "2026-08-27", estado: "Rechazado" },
    { id: "14", candidatoId: "4", vacanteId: "6", fecha: "2026-08-28", estado: "En revisión" },
    { id: "15", candidatoId: "7", vacanteId: "1", fecha: "2026-08-29", estado: "Entrevista" }
];

let candidatos = [];
let vacantes = [];
let postulaciones = [];
let usarFallback = false;


// ===============================
// INICIO
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    document
        .getElementById("formPostulacion")
        .addEventListener("submit", crearPostulacion);

});


// ===============================
// CARGAR DATOS
// ===============================

async function cargarDatos() {

    try {

        candidatos = await obtenerDatos("candidatos");
        vacantes = await obtenerDatos("vacantes");
        postulaciones = await obtenerDatos("postulaciones");

    } catch (error) {

        console.warn("API no disponible, usando datos pre-cargados:", error.message);

        usarFallback = true;
        candidatos = [...candidatosPreCargados];
        vacantes = [...vacantesPreCargadas];
        postulaciones = [...postulacionesPreCargadas];

    }

    cargarSelectCandidatos();
    cargarSelectVacantes();
    mostrarPostulaciones();

}


// ===============================
// CANDIDATOS
// ===============================

function cargarSelectCandidatos() {

    const select = document.getElementById("candidato");

    select.innerHTML =
        '<option value="">Seleccione un candidato</option>';

    candidatos.forEach(candidato => {

        const option = document.createElement("option");

        option.value = candidato.id;

        option.textContent =
            `${candidato.nombre} - ${candidato.profesion}`;

        select.appendChild(option);

    });

}


// ===============================
// VACANTES
// ===============================

function cargarSelectVacantes() {

    const select = document.getElementById("vacante");

    select.innerHTML =
        '<option value="">Seleccione una vacante</option>';

    vacantes.forEach(vacante => {

        const option = document.createElement("option");

        option.value = vacante.id;

        option.textContent =
            `${vacante.titulo} - ${vacante.empresa} (${vacante.ubicacion})`;

        select.appendChild(option);

    });

}


// ===============================
// MOSTRAR POSTULACIONES
// ===============================

function mostrarPostulaciones() {

    const tabla =
        document.getElementById("tablaPostulaciones");

    tabla.innerHTML = "";

    postulaciones.forEach(postulacion => {

        const candidato =
            candidatos.find(
                c => String(c.id) === String(postulacion.candidatoId)
            );

        const vacante =
            vacantes.find(
                v => String(v.id) === String(postulacion.vacanteId)
            );

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>${postulacion.id}</td>

            <td>
                ${candidato
                    ? candidato.nombre
                    : "No encontrado"}
            </td>

            <td>
                ${candidato
                    ? candidato.email
                    : "-"}
            </td>

            <td>
                ${candidato
                    ? candidato.telefono
                    : "-"}
            </td>

            <td>
                ${vacante
                    ? vacante.titulo
                    : "No encontrada"}
            </td>

            <td>
                ${vacante
                    ? vacante.empresa
                    : "-"}
            </td>

            <td>
                ${vacante
                    ? vacante.ubicacion
                    : "-"}
            </td>

            <td>
                ${postulacion.fecha}
            </td>

            <td>

                <select
                    onchange="cambiarEstado(${postulacion.id}, this.value)"
                >

                    <option
                        value="En revisión"
                        ${postulacion.estado === "En revisión" ? "selected" : ""}
                    >
                        En revisión
                    </option>

                    <option
                        value="Entrevista"
                        ${postulacion.estado === "Entrevista" ? "selected" : ""}
                    >
                        Entrevista
                    </option>

                    <option
                        value="Seleccionado"
                        ${postulacion.estado === "Seleccionado" ? "selected" : ""}
                    >
                        Seleccionado
                    </option>

                    <option
                        value="Rechazado"
                        ${postulacion.estado === "Rechazado" ? "selected" : ""}
                    >
                        Rechazado
                    </option>

                </select>

            </td>

            <td>

                <button
                    class="btn-delete"
                    onclick="eliminarPostulacion(${postulacion.id})"
                >
                    Eliminar
                </button>

            </td>

        `;

        tabla.appendChild(fila);

    });

}


// ===============================
// POST
// ===============================

async function crearPostulacion(event) {

    event.preventDefault();

    const candidatoId =
        document.getElementById("candidato").value;

    const vacanteId =
        document.getElementById("vacante").value;

    const fecha =
        document.getElementById("fecha").value;

    const estado =
        document.getElementById("estado").value;


    const nuevaPostulacion = {
        candidatoId: candidatoId,
        vacanteId: vacanteId,
        fecha: fecha,
        estado: estado
    };


    if (usarFallback) {

        nuevaPostulacion.id = String(
            postulaciones.length > 0
                ? Math.max(...postulaciones.map(p => Number(p.id))) + 1
                : 1
        );

        postulaciones.push(nuevaPostulacion);

        alert("Postulación creada correctamente.");

        document.getElementById("formPostulacion").reset();

        mostrarPostulaciones();

        return;

    }


    try {

        await crearDato(
            "postulaciones",
            nuevaPostulacion
        );

        alert("Postulación creada correctamente.");

        document
            .getElementById("formPostulacion")
            .reset();

        cargarDatos();

    } catch (error) {

        console.error(error);

        alert("No se pudo crear la postulación.");

    }

}


// ===============================
// PATCH
// ===============================

async function cambiarEstado(id, nuevoEstado) {

    if (usarFallback) {

        const postulacion =
            postulaciones.find(
                p => Number(p.id) === Number(id)
            );

        if (postulacion) {
            postulacion.estado = nuevoEstado;
        }

        alert("Estado actualizado correctamente.");

        return;

    }

    try {

        await actualizarDato(
            "postulaciones",
            id,
            { estado: nuevoEstado }
        );

        alert("Estado actualizado correctamente.");

        cargarDatos();

    } catch (error) {

        console.error(error);

        alert("No se pudo actualizar el estado.");

    }

}


// ===============================
// DELETE
// ===============================

async function eliminarPostulacion(id) {

    const confirmar =
        confirm("¿Está seguro de eliminar esta postulación?");

    if (!confirmar) {
        return;
    }

    if (usarFallback) {

        postulaciones =
            postulaciones.filter(
                p => Number(p.id) !== Number(id)
            );

        alert("Postulación eliminada.");

        mostrarPostulaciones();

        return;

    }

    try {

        await eliminarDato(
            "postulaciones",
            id
        );

        alert("Postulación eliminada.");

        cargarDatos();

    } catch (error) {

        console.error(error);

        alert("No se pudo eliminar la postulación.");

    }

}
