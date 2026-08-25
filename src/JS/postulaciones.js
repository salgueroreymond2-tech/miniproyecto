let candidatos = [];
let vacantes = [];
let postulaciones = [];


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

        cargarSelectCandidatos();
        cargarSelectVacantes();
        mostrarPostulaciones();

    } catch (error) {

        console.error(error);

        alert("No se pudieron cargar los datos.");

    }

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
            `${vacante.titulo} - ${vacante.empresa}`;

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
                    : "Candidato no encontrado"}
            </td>

            <td>
                ${vacante
                    ? vacante.titulo
                    : "Vacante no encontrada"}
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

    try {

        await actualizarDato(
            "postulaciones",
            id,
            {
                estado: nuevoEstado
            }
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
        confirm(
            "¿Está seguro de eliminar esta postulación?"
        );

    if (!confirmar) {
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