# Bitácora técnica de NotebookLM — Ernesto

## Información general

* Proyecto: JobConnect
* Integrante: Ernesto Libby Lugo
* Área asignada: autenticación, sesión y dashboard protegido
* Herramientas: JavaScript, Fetch API, JSON Server, localStorage y NotebookLM
* Fecha: 25 de agosto de 2026

## Fuentes cargadas en NotebookLM

Para realizar las consultas se creó el cuaderno “JobConnect - Autenticación Ernesto” y se agregaron las siguientes fuentes:

1. Documentación de Fetch API de MDN.
2. Documentación de JSON Server.
3. Código de autenticación de JobConnect.
4. Enunciado y requisitos del mini proyecto.
5. Fragmento específico del evento submit del formulario de autenticación.

## Consulta técnica 1

### Pregunta

¿Cómo puedo validar credenciales mediante Fetch API contra JSON Server y manejar correctamente los errores usando async/await y try/catch? Analiza también si el código de autenticación de JobConnect aplica correctamente estas prácticas.

### Resumen de la respuesta

NotebookLM explicó que Fetch API devuelve una promesa y que una respuesta HTTP con error no siempre provoca automáticamente el rechazo de esa promesa. Por esta razón, es necesario comprobar `response.ok` y lanzar un error manual cuando la respuesta no es exitosa.

También señaló que `response.json()` es una operación asíncrona y debe procesarse mediante `await`. Para validar credenciales contra JSON Server, la respuesta puede revisarse como un arreglo: si el arreglo está vacío, no existe un usuario que coincida con las credenciales ingresadas.

El bloque `try/catch` permite capturar errores de conexión, errores de procesamiento y errores lanzados manualmente. El bloque `finally` permite restaurar el botón de inicio de sesión independientemente del resultado.

### Aplicación en JobConnect

La implementación desarrollada utiliza:

* `fetch()` para consultar `/usuarios`.
* `URLSearchParams` para construir la consulta.
* `async/await` para esperar la respuesta.
* `response.ok` para detectar respuestas HTTP fallidas.
* `response.json()` para procesar los usuarios.
* `try/catch` para controlar errores de conexión.
* `finally` para habilitar nuevamente el botón.
* Mensajes visuales para campos vacíos, credenciales incorrectas y API no disponible.

### Incidencia detectada al usar NotebookLM

NotebookLM interpretó de forma truncada el código copiado y afirmó incorrectamente que el evento `submit` no contenía `fetch`. La respuesta fue contrastada con el archivo `src/main.js` y con pruebas reales de ejecución.

La aplicación sí realizó la consulta contra JSON Server y permitió ingresar con las credenciales válidas. También rechazó una contraseña incorrecta y mostró un mensaje cuando no pudo conectarse con la API.

Esta incidencia demostró que las respuestas generadas por inteligencia artificial deben verificarse contra el código fuente y mediante pruebas funcionales.

## Consulta técnica 2

### Pregunta

¿Cómo debe administrarse una sesión educativa usando localStorage? Analiza las funciones `obtenerSesion()`, `guardarSesion()`, `cerrarSesion()` e `iniciarAplicacion()` del código de JobConnect. Explica cómo protegen el dashboard, cómo eliminan la sesión y cuáles son las limitaciones de seguridad de este método frente a una autenticación real con backend.

### Resumen de la respuesta

NotebookLM explicó correctamente el funcionamiento de las cuatro funciones:

* `guardarSesion()` construye un objeto con los datos mínimos del usuario, genera un identificador educativo con `crypto.randomUUID()` y guarda la información en localStorage mediante `JSON.stringify()`.
* `obtenerSesion()` recupera y procesa la sesión. Si el contenido está dañado, el bloque `try/catch` elimina la información inválida y devuelve `null`.
* `cerrarSesion()` elimina la clave `jobconnect_session` y vuelve a mostrar el formulario de acceso.
* `iniciarAplicacion()` decide si debe mostrar el login o el dashboard dependiendo de la existencia de una sesión.

El dashboard también realiza una segunda verificación antes de renderizarse. Si no existe una sesión, la ejecución se detiene y se vuelve a mostrar el login.

### Limitaciones identificadas

NotebookLM indicó que este sistema es apropiado únicamente para un proyecto educativo, porque:

* localStorage puede modificarse desde las herramientas del navegador.
* El UUID generado en el frontend no es un token firmado.
* Un script malicioso podría leer localStorage si existiera una vulnerabilidad XSS.
* JSON Server no aplica autorización real sobre los endpoints.
* La API podría consultarse directamente sin pasar por el formulario.

En una aplicación de producción, la autenticación debe validarse en un backend y utilizar sesiones seguras o tokens firmados y verificados por el servidor.

## Resultado de las pruebas

Se realizaron las siguientes pruebas:

* Inicio de sesión con credenciales válidas: correcto.
* Rechazo de contraseña incorrecta: correcto.
* Mensaje cuando JSON Server no está disponible: correcto.
* Persistencia de la sesión al actualizar: correcta.
* Protección del dashboard sin sesión: correcta.
* Cierre de sesión y eliminación de localStorage: correcto.
* Navegación visual entre los seis módulos: correcta.
* Construcción de producción con `npm run build`: correcta.

## Conclusión

NotebookLM ayudó a repasar el funcionamiento de Fetch API, async/await, try/catch y localStorage. También permitió identificar las limitaciones del sistema educativo frente a una autenticación de producción.

Sin embargo, una de sus respuestas interpretó incorrectamente un fragmento de código. Por eso, las recomendaciones fueron comparadas con las fuentes originales y verificadas ejecutando la aplicación. NotebookLM se utilizó como apoyo para investigar y razonar, no como sustituto de las pruebas técnicas.
