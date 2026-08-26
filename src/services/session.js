const SESSION_KEY = 'jobconnect_session';
const LOGIN_URL = '/index.html';

export function obtenerSesion() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession);
    if (!session || !session.id || !session.nombre) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function exigirSesion() {
  const session = obtenerSesion();
  if (!session) {
    window.location.replace(LOGIN_URL);
    return null;
  }

  return session;
}

export function obtenerIniciales(nombre = '') {
  return nombre.trim().split(/\s+/).map(parte => parte[0]).join('').toUpperCase().slice(0, 2) || 'JC';
}

export function actualizarNavbarSesion(session = obtenerSesion()) {
  if (!session) return;

  const nombre = session.nombre || session.username || 'Usuario';
  const rol = session.rol || 'Usuario';
  const iniciales = obtenerIniciales(nombre);

  document.querySelectorAll('[data-session-name]').forEach(elemento => {
    elemento.textContent = nombre;
  });
  document.querySelectorAll('[data-session-role]').forEach(elemento => {
    elemento.textContent = rol;
  });
  document.querySelectorAll('[data-session-avatar]').forEach(elemento => {
    elemento.textContent = iniciales;
    elemento.setAttribute('title', nombre);
  });
  document.querySelectorAll('[data-session-logout]').forEach(elemento => {
    elemento.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      window.location.replace(LOGIN_URL);
    }, { once: true });
  });
}
