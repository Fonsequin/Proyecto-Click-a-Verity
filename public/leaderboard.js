const INTERVALO_MS = 5000;

const sesionActual = obtenerSesion(); 
const cuerpoTabla = document.querySelector("#cuerpoTabla");
const estadoLeaderboard = document.querySelector("#estado");

function formatearNumero(numero) {
  return Number(numero).toLocaleString("es-AR");
}

// evitar la inyeccion html //
function crearFila(puesto, nombre, puntos, esYo) {
  const fila = document.createElement("tr");

  [puesto, nombre, formatearNumero(puntos)].forEach(valor => {
    const celda = document.createElement("td");
    celda.textContent = valor;
    fila.appendChild(celda);
  });

  if (esYo) fila.classList.add("fila-yo");
  return fila;
}

function crearFilaMensaje(texto) {
  const fila = document.createElement("tr");
  const celda = document.createElement("td");
  celda.colSpan = 3;
  celda.textContent = texto;
  fila.appendChild(celda);
  return fila;
}

async function actualizarLeaderboard() {
  try {
    const peticiones = [fetch("/leaderboard")];
    if (sesionActual) {
      peticiones.push(fetch(`/usuarios/${sesionActual.usuarioID}/estadisticas`));
    }

    const [respTop, respYo] = await Promise.all(peticiones);
    if (!respTop.ok) throw new Error("Error al leer el leaderboard");

    const top = await respTop.json();
    const yo = respYo && respYo.ok ? await respYo.json() : null;

    cuerpoTabla.innerHTML = "";

    if (top.length === 0) {
      cuerpoTabla.appendChild(crearFilaMensaje("Todavia no hay jugadores"));
    }

    top.forEach((jugador, indice) => {
      const esYo = sesionActual && jugador.usuarioID === sesionActual.usuarioID;
      cuerpoTabla.appendChild(
        crearFila(indice + 1, jugador.nombre, jugador.puntos_totales, esYo)
      );
    });

    // si el usuario no esta en el top se pone abajo //
    if (yo && yo.puesto > top.length) {
      cuerpoTabla.appendChild(crearFilaMensaje("..."));
      cuerpoTabla.appendChild(crearFila(yo.puesto, yo.nombre, yo.puntos_totales, true));
    }

    estadoLeaderboard.textContent =
      `Se actualiza solo cada ${INTERVALO_MS / 1000} segundos`;
  } catch (error) {
    estadoLeaderboard.textContent = "Sin conexion con el servidor, reintentando...";
  }
}

actualizarLeaderboard();
setInterval(actualizarLeaderboard, INTERVALO_MS);