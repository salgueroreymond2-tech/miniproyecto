const API_URL = "http://localhost:3000";

// GET
async function obtenerDatos(recurso) {
    const respuesta = await fetch(`${API_URL}/${recurso}`);

    if (!respuesta.ok) {
        throw new Error(`Error al obtener ${recurso}`);
    }

    return await respuesta.json();
}

// POST
async function crearDato(recurso, datos) {
    const respuesta = await fetch(`${API_URL}/${recurso}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
        throw new Error(`Error al crear ${recurso}`);
    }

    return await respuesta.json();
}

// PATCH
async function actualizarDato(recurso, id, datos) {
    const respuesta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
        throw new Error(`Error al actualizar ${recurso}`);
    }

    return await respuesta.json();
}

// DELETE
async function eliminarDato(recurso, id) {
    const respuesta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) {
        throw new Error(`Error al eliminar ${recurso}`);
    }

    return true;
}