import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tareas: resolve(import.meta.dirname, 'tareas-e-interfaz/tareas.html'),
        vacantes: resolve(import.meta.dirname, 'pages/vacantes.html'),
        empresas: resolve(import.meta.dirname, 'pages/empresas.html'),
        postulaciones: resolve(import.meta.dirname, 'src/pages/postulaciones.html'),
        entrevistas: resolve(import.meta.dirname, 'src/pages/entrevistas.html'),
      }
    }
  },
  server: {
    port: 5173
  }
})
