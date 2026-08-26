# Documentacion tecnica de JobConnect

## 1. Descripcion general

JobConnect es una aplicacion web frontend para gestionar procesos de empleabilidad. La interfaz permite iniciar sesion y consultar los modulos de dashboard, vacantes, empresas, postulaciones, entrevistas y tareas.

El proyecto utiliza JavaScript en el navegador, Vite como herramienta de desarrollo y JSON Server como API local para persistir los datos de prueba.

## 2. Tecnologias

- HTML5 y CSS3 para la estructura y los estilos.
- JavaScript con modulos ES para la logica de la interfaz.
- Vite para ejecutar el entorno de desarrollo y generar la compilacion de produccion.
- JSON Server para exponer `db.json` mediante una API REST local.
- Fetch API y `async/await` para las peticiones HTTP.
- `localStorage` para conservar la sesion del usuario en el navegador.

## 3. Instalacion y ejecucion

Requisitos: Node.js y npm.

```bash
npm install
```

En una terminal, iniciar la API local:

```bash
npm run server
```

En otra terminal, iniciar Vite:

```bash
npm run dev
```

Vite mostrara la URL local de la aplicacion, normalmente `http://localhost:5173`.

Para generar la version de produccion:

```bash
npm run build
```

Para previsualizar la compilacion:

```bash
npm run preview
```

Los scripts `server` y `api` ejecutan la misma tarea: iniciar JSON Server en el puerto `3000`.

## 4. Estructura principal

```text
.
├── db.json                 # Datos usados por JSON Server
├── index.html              # Entrada HTML del dashboard
├── package.json            # Scripts y dependencias
├── pages/                  # Paginas de empresas y vacantes
├── src/
│   ├── main.js             # Login, sesion, dashboard y navegacion
│   ├── style.css           # Estilos generales del dashboard
│   ├── services/
│   │   ├── api.js          # Cliente HTTP comun
│   │   ├── empresasService.js
│   │   └── vacantesService.js
│   ├── JS/                 # Logica de postulaciones, entrevistas y vacantes
│   ├── pages/               # Paginas de candidatos, entrevistas y postulaciones
│   └── img/                 # Recursos visuales
├── tareas-e-interfaz/       # Interfaz y logica del modulo de tareas
├── docs/                    # Bitacoras y reflexiones del proyecto
└── documentacion/           # Documentacion tecnica del codigo
```

## 5. Flujo de autenticacion y sesion

1. Al cargar la aplicacion, `src/main.js` consulta `localStorage` usando la clave `jobconnect_session`.
2. Si no existe una sesion valida, se muestra el formulario de login.
3. El formulario consulta `/usuarios` en JSON Server mediante `fetch` y filtra por usuario y contrasena.
4. Con credenciales validas, `guardarSesion()` conserva los datos basicos del usuario y genera un identificador con `crypto.randomUUID()`.
5. `mostrarDashboard()` comprueba nuevamente que exista una sesion antes de renderizar el panel.
6. `cerrarSesion()` elimina la sesion y devuelve al usuario al login.
7. Si JSON Server no esta disponible, existe un acceso local de prueba con el usuario `emilys` y la contrasena `emilyspass`.

Las credenciales de prueba tambien aparecen en la pantalla de acceso.

## 6. Dashboard y modulos

`cargarMetricas()` solicita en paralelo el numero de registros de vacantes, empresas, postulaciones, entrevistas y tareas. Si una consulta falla, se muestran valores de respaldo para que el dashboard siga siendo util durante una demostracion.

La navegacion principal conecta con estas paginas:

- Dashboard: `/index.html`
- Vacantes: `/pages/vacantes.html`
- Empresas: `/pages/empresas.html`
- Postulaciones: `/src/pages/postulaciones.html`
- Entrevistas: `/src/pages/entrevistas.html`
- Tareas: `/tareas-e-interfaz/tareas.html`

## 7. Capa de servicios y API

`src/services/api.js` centraliza las peticiones HTTP. La funcion `request(endpoint, method, body)`:

- Construye la URL usando `http://localhost:3000`.
- Agrega `Content-Type: application/json` para peticiones con cuerpo.
- Convierte el cuerpo a JSON.
- Comprueba los errores HTTP y lanza una excepcion cuando la respuesta no es exitosa.
- Devuelve la respuesta procesada con `response.json()`.

Los servicios de empresas y vacantes reutilizan este cliente y ofrecen operaciones para listar, consultar por identificador, crear, actualizar y eliminar registros.

## 8. Recursos de datos

JSON Server expone los recursos definidos en `db.json` como endpoints REST. Entre los recursos actuales se encuentran:

- `GET /usuarios`
- `GET /vacantes`
- `GET /empresas`
- `GET /postulaciones`
- `GET /entrevistas`
- `GET /tareas`

JSON Server modifica `db.json` cuando se realizan operaciones de escritura. Por eso conviene mantener una copia de los datos iniciales antes de hacer pruebas destructivas.

## 9. Consideraciones de seguridad

La autenticacion actual es educativa y no debe utilizarse en produccion. `localStorage` puede ser modificado desde el navegador, el identificador generado en frontend no es un token firmado y JSON Server no aplica autorizacion real sobre los endpoints.

Para un entorno real, la validacion de credenciales debe ejecutarse en un backend. La sesion deberia utilizar mecanismos seguros, como cookies protegidas o tokens firmados y verificados por el servidor. Tambien deben anadirse validacion de entradas, control de permisos y protecciones contra XSS y CSRF segun la arquitectura elegida.

## 10. Verificacion rapida

1. Ejecutar JSON Server y Vite.
2. Iniciar sesion con las credenciales de prueba.
3. Confirmar que el dashboard muestra las metricas.
4. Recorrer los seis modulos desde la navegacion.
5. Recargar la pagina y confirmar que la sesion persiste.
6. Pulsar `Salir` y comprobar que vuelve al formulario de login.
7. Ejecutar `npm run build` para validar la compilacion de produccion.
