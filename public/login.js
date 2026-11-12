// Si ya hay sesion iniciada, ir directo al juego
if (obtenerSesion()) {
  window.location.href = "index.html";
}

const formulario = document.querySelector("#formulario");
const inputUsuario = document.querySelector("#usuario");
const inputContrasena = document.querySelector("#contrasena");
const botonEntrar = document.querySelector("#botonEntrar");
const imagenEntrar = botonEntrar.querySelector("img");
const tituloForm = document.querySelector("#tituloForm");
const mensaje = document.querySelector("#mensaje");
const botonAlternar = document.querySelector("#alternar");

let modoRegistro = false;

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
}

// cambio de verity
function actualizarBoton() {
  const listo = inputUsuario.value.trim() !== "" && inputContrasena.value !== "";
  imagenEntrar.classList.toggle("active", listo);
}

inputUsuario.addEventListener("input", actualizarBoton);
inputContrasena.addEventListener("input", actualizarBoton);

botonAlternar.addEventListener("click", function () {
  modoRegistro = !modoRegistro;
  tituloForm.textContent = modoRegistro ? "Registro" : "Login";
  botonAlternar.textContent = modoRegistro
    ? "Ya tengo cuenta, iniciar sesion"
    : "No tengo cuenta, registrarme";
  mostrarMensaje("");
});

async function enviarFormulario() {
  const nombre = inputUsuario.value.trim();
  const contrasena = inputContrasena.value;

  if (nombre === "" || contrasena === "") {
    mostrarMensaje("Completa usuario y contraseña");
    return;
  }

  if (modoRegistro && (nombre.length < 3 || nombre.length > 25)) {
    mostrarMensaje("El usuario debe tener entre 3 y 25 caracteres");
    return;
  }

  if (modoRegistro && contrasena.length < 4) {
    mostrarMensaje("La contraseña debe tener al menos 4 caracteres");
    return;
  }

  try {
    const ruta = modoRegistro ? "/registro" : "/login";
    const respuesta = await fetch(ruta, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, contrasena })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(datos.mensaje || "Ocurrio un error");
      return;
    }

    guardarSesion(datos.usuarioID, datos.nombre);
    window.location.href = "index.html";
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el servidor");
  }
}

// Enter en los campos
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  enviarFormulario();
});

// Click en Verity
botonEntrar.addEventListener("click", function (evento) {
  evento.preventDefault();
  enviarFormulario();
});