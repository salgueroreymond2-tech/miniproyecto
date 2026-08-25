# Reflexión individual sobre NotebookLM

## Integrante

Ernesto Libby Lugo

## Proyecto

JobConnect — Sistema frontend para una empresa de empleabilidad

## Responsabilidad desarrollada

Mi responsabilidad fue implementar la autenticación, el almacenamiento de la sesión, la protección del dashboard, el cierre de sesión y la estructura visual donde posteriormente se integrarán los seis módulos del sistema.

## Uso de NotebookLM

NotebookLM fue utilizado para consultar documentación sobre Fetch API, async/await, try/catch, JSON Server y localStorage. Las fuentes cargadas incluyeron documentación técnica, el enunciado del proyecto y el código de autenticación desarrollado.

La herramienta me ayudó a comprender por qué `fetch()` no considera automáticamente como excepción todos los errores HTTP y por qué es necesario revisar `response.ok`. También permitió repasar el uso de `response.json()`, el manejo de errores mediante `try/catch` y la restauración de la interfaz mediante `finally`.

En relación con localStorage, NotebookLM permitió analizar cómo se guarda, recupera y elimina una sesión. También ayudó a reconocer que esta protección es únicamente educativa y no equivale a una autenticación segura de producción.

## Verificación crítica de la inteligencia artificial

Durante la investigación, NotebookLM interpretó de forma incompleta uno de los fragmentos de código y afirmó que no existía una llamada a `fetch()`. Esta conclusión no coincidía con el archivo real.

Para comprobarlo, revisé `src/main.js` y ejecuté pruebas contra JSON Server. El login realizó correctamente la consulta, permitió el acceso con credenciales válidas, rechazó credenciales incorrectas y mostró un mensaje cuando la API no estaba disponible.

Esta experiencia me enseñó que una respuesta generada por inteligencia artificial no debe aceptarse automáticamente. Es necesario compararla con las fuentes, revisar el código y realizar pruebas funcionales.

## Aprendizaje obtenido

Aprendí a:

* Consumir una API local mediante Fetch API.
* Utilizar async/await para controlar operaciones asíncronas.
* Detectar errores HTTP mediante `response.ok`.
* Manejar fallos de red con `try/catch`.
* Utilizar `finally` para restaurar el estado de la interfaz.
* Guardar y recuperar información mediante localStorage.
* Restringir visualmente el dashboard cuando no existe una sesión.
* Eliminar la sesión mediante un botón de cierre.
* Diferenciar una simulación educativa de una autenticación real con backend.
* Verificar críticamente las respuestas generadas por inteligencia artificial.

## Conclusión

NotebookLM fue útil como herramienta de investigación y análisis, especialmente para comprender conceptos técnicos y limitaciones de seguridad. Sin embargo, su aporte fue más valioso cuando se combinó con revisión manual, ejecución del código y pruebas reales.

La herramienta apoyó el proceso de aprendizaje, pero la decisión final sobre la validez de la implementación se basó en evidencia técnica y en el funcionamiento comprobado de JobConnect.
