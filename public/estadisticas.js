const INTERVALO_MS = 3000;

const sesionActual = requerirSesion();
const estadoEstadisticas = document.querySelector("#estado");

function formatearNumero(numero) {
  return Number(numero).toLocaleString("es-AR");
}

function formatearTiempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;

  return [horas, minutos, resto]
    .map(valor => String(valor).padStart(2, "0"))
    .join(":");
}

function poner(id, texto) {
  document.querySelector(id).textContent = texto;
}

function calcularPuntosPorClick(mejoras) {
  const cantidad = id => {
    const mejora = mejoras.find(m => m.mejoraID === id);
    return mejora ? mejora.cantidad : 0;
  };
  return (1 + cantidad(1)) * Math.pow(2, cantidad(3));
}

async function actualizarEstadisticas() {
  if (!sesionActual) return;

  try {
    const respuesta = await fetch(`/usuarios/${sesionActual.usuarioID}/estadisticas`);

    if (respuesta.status === 404) {
      cerrarSesion(); 
      return;
    }
    if (!respuesta.ok) throw new Error("Error al leer las estadisticas");

    const datos = await respuesta.json();

    poner("#statPuntosTotales", formatearNumero(datos.puntos_totales));
    poner("#statClicks", formatearNumero(datos.clicks));
    poner("#statMejoras", formatearNumero(datos.mejoras_compradas));
    poner("#statTiempo", formatearTiempo(datos.tiempo_jugado));
    poner("#statPuntosClick", formatearNumero(calcularPuntosPorClick(datos.mejoras)));
    poner("#statPuntosSegundo", formatearNumero(datos.puntos_por_segundo));
    poner("#statLogros", `${datos.logros_desbloqueados} / ${datos.total_logros}`);
    poner("#statPuesto", `#${datos.puesto} de ${datos.total_jugadores}`);

    estadoEstadisticas.textContent =
      `Se actualiza solo cada ${INTERVALO_MS / 1000} segundos`;
  } catch (error) {
    estadoEstadisticas.textContent = "Sin conexion con el servidor, reintentando...";
  }
}

actualizarEstadisticas();
setInterval(actualizarEstadisticas, INTERVALO_MS);