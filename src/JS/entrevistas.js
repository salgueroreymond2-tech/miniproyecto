let candidatos = [];
let vacantes = [];
let postulaciones = [];
let entrevistas = [];


// ======================================
// INICIO
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    document
        .getElementById("formEntrevista")
        .addEventListener("submit", crearEntrevista);

});


// ======================================
// CARGAR DATOS
// ======================================

async function cargarDatos() {

    try {

        candidatos =
            await obtenerDatos("candidatos");

        vacantes =
            await obtenerDatos("vacantes");

        postulaciones =
            await obtenerDatos("postulaciones");

        entrevistas =
            await obtenerDatos("entrevistas");


        cargarSelectPostulaciones();

        mostrarEntrevistas();

    } catch (error) {

        console.error(error);

        alert(
            "No se pudieron cargar los datos."
        );

    }

}


// ======================================
// CARGAR POSTULACIONES
// ======================================

function cargarSelectPostulaciones() {

    const select =
        document.getElementById("postulacion");

    select.innerHTML =
        '<option value="">Seleccione una postulación</option>';


    postulaciones.forEach(postulacion => {

        const candidato =
            candidatos.find(
                c =>
                    String(c.id) ===
                    String(postulacion.candidatoId)
            );


        const vacante =
            vacantes.find(
                v =>
                    String(v.id) ===
                    String(postulacion.vacanteId)
            );


        const option =
            document.createElement("option");


        option.value =
            postulacion.id;


        option.textContent =
            `${candidato?.nombre || "Candidato"} - ${vacante?.titulo || "Vacante"}`;


        select.appendChild(option);

    });

}


// ======================================
// MOSTRAR ENTREVISTAS
// ======================================

function mostrarEntrevistas() {

    const tabla =
        document.getElementById(
            "tablaEntrevistas"
        );


    tabla.innerHTML = "";


    entrevistas.forEach(entrevista => {


        const candidato =
            candidatos.find(
                c =>
                    String(c.id) ===
                    String(entrevista.candidatoId)
            );


        const vacante =
            vacantes.find(
                v =>
                    String(v.id) ===
                    String(entrevista.vacanteId)
            );


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${entrevista.id}
            </td>


            <td>
                ${candidato?.nombre || "No encontrado"}
            </td>


            <td>
                ${vacante?.titulo || "No encontrada"}
            </td>


            <td>
                ${entrevista.fecha}
            </td>


            <td>
                ${entrevista.hora}
            </td>


            <td>

                <select
                    onchange="cambiarResultado(
                        ${entrevista.id},
                        this.value
                    )"
                >

                    <option
                        value="Pendiente"
                        ${entrevista.resultado === "Pendiente"
                            ? "selected"
                            : ""}
                    >
                        Pendiente
                    </option>


                    <option
                        value="Aprobado"
                        ${entrevista.resultado === "Aprobado"
                            ? "selected"
                            : ""}
                    >
                        Aprobado
                    </option>


                    <option
                        value="Rechazado"
                        ${entrevista.resultado === "Rechazado"
                            ? "selected"
                            : ""}
                    >
                        Rechazado
                    </option>

                </select>

            </td>


            <td>

                <span class="notas">
                    ${entrevista.notas || "Sin notas"}
                </span>

            </td>


            <td>

                <button
                    class="btn-edit"
                    onclick="editarNotas(${entrevista.id})"
                >
                    Editar
                </button>


                <button
                    class="btn-delete"
                    onclick="eliminarEntrevista(${entrevista.id})"
                >
                    Eliminar
                </button>

            </td>

        `;


        tabla.appendChild(fila);

    });

}


// ======================================
// POST
// ======================================

async function crearEntrevista(event) {

    event.preventDefault();


    const postulacionId =
        document.getElementById(
            "postulacion"
        ).value;


    const fecha =
        document.getElementById(
            "fecha"
        ).value;


    const hora =
        document.getElementById(
            "hora"
        ).value;


    const resultado =
        document.getElementById(
            "resultado"
        ).value;


    const notas =
        document.getElementById(
            "notas"
        ).value;


    const postulacion =
        postulaciones.find(
            p =>
                String(p.id) ===
                String(postulacionId)
        );


    if (!postulacion) {

        alert(
            "No se encontró la postulación."
        );

        return;

    }


    const nuevaEntrevista = {

        postulacionId: postulacion.id,

        candidatoId:
            postulacion.candidatoId,

        vacanteId:
            postulacion.vacanteId,

        fecha: fecha,

        hora: hora,

        resultado: resultado,

        notas: notas

    };


    try {

        await crearDato(
            "entrevistas",
            nuevaEntrevista
        );


        // También cambiamos el estado
        // de la postulación a Entrevista

        await actualizarDato(
            "postulaciones",
            postulacion.id,
            {
                estado: "Entrevista"
            }
        );


        alert(
            "Entrevista registrada correctamente."
        );


        document
            .getElementById(
                "formEntrevista"
            )
            .reset();


        cargarDatos();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo registrar la entrevista."
        );

    }

}


// ======================================
// PATCH - RESULTADO
// ======================================

async function cambiarResultado(
    id,
    nuevoResultado
) {

    try {

        await actualizarDato(
            "entrevistas",
            id,
            {
                resultado: nuevoResultado
            }
        );


        alert(
            "Resultado actualizado correctamente."
        );


        cargarDatos();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo actualizar el resultado."
        );

    }

}


// ======================================
// PATCH - NOTAS
// ======================================

async function editarNotas(id) {

    const entrevista =
        entrevistas.find(
            e =>
                String(e.id) ===
                String(id)
        );


    if (!entrevista) {

        alert(
            "No se encontró la entrevista."
        );

        return;

    }


    const nuevasNotas =
        prompt(
            "Escriba las nuevas notas de la entrevista:",
            entrevista.notas || ""
        );


    if (nuevasNotas === null) {

        return;

    }


    try {

        await actualizarDato(
            "entrevistas",
            id,
            {
                notas: nuevasNotas
            }
        );


        alert(
            "Notas actualizadas correctamente."
        );


        cargarDatos();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudieron actualizar las notas."
        );

    }

}


// ======================================
// DELETE
// ======================================

async function eliminarEntrevista(id) {

    const confirmar =
        confirm(
            "¿Está seguro de eliminar esta entrevista?"
        );


    if (!confirmar) {

        return;

    }


    try {

        await eliminarDato(
            "entrevistas",
            id
        );


        alert(
            "Entrevista eliminada correctamente."
        );


        cargarDatos();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo eliminar la entrevista."
        );

    }

}