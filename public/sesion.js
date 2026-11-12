// Manejo de sesion (guarda quien esta logueado en este navegador)
const CLAVE_SESION = "sesionVerity";

function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch (error) {
    return null;
  }
}

function guardarSesion(usuarioID, nombre) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ usuarioID, nombre }));
}

function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  window.location.href = "login.html";
}

// Si no hay sesion, manda al login
function requerirSesion() {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.href = "login.html";
  }
  return sesion;
}