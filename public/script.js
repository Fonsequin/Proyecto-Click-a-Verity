// ============================================================
// CLICK A VERITY - script.js
// Todo el progreso se guarda en la base de datos (nada en el navegador
// salvo la sesion). Requiere que sesion.js se cargue antes.
// ============================================================

const sesion = requerirSesion();

// ---------- CONFIGURACION DE MEJORAS (ajustala a tu gusto) ----------
// costo = BASE * AUMENTO ^ (veces compradas), redondeado hacia arriba
const BASE_MEJORA1 = 20;   // Click rapido  (+1 por click)
const AUMENTO_MEJORA1 = 1.15;

const BASE_MEJORA2 = 50;   // Helpity (+1 punto por segundo)
const AUMENTO_MEJORA2 = 1.15;

const BASE_MEJORA3 = 100;  // Doble click (x2 al valor del click)
const AUMENTO_MEJORA3 = 2;

// ---------- ELEMENTOS DEL HTML ----------
const botonClick = document.querySelector("#botonClick");
const contadorPuntos = document.querySelector("#contadorPuntos");
const botonMejora1 = document.querySelector("#mejora1");
const botonMejora2 = document.querySelector("#mejora2");
const botonMejora3 = document.querySelector("#mejora3");
const contenedorLogros = document.querySelector("#logros");

// ---------- ESTADO DEL JUEGO ----------
let puntos = 0;              // puntos actuales (se gastan)
let puntosTotales = 0;       // puntos historicos (para el leaderboard)
let clicksTotales = 0;
let puntosPorSegundo = 0;
let tiempoJugado = 0;        // en segundos

let dedoRapidoComprado = 0;  // mejora 1
let ayudanteComprado = 0;    // mejora 2
let dobleClickComprado = 0;  // mejora 3

let valorPorClick = 1;
let costoMejora1 = BASE_MEJORA1;
let costoMejora2 = BASE_MEJORA2;
let costoMejora3 = BASE_MEJORA3;

let hayCambios = false;      // hay algo para enviar al servidor
let partidaCargada = false;  // evita pisar tu progreso con ceros si falla la carga

// ---------- LOGROS ----------
let catalogoLogros = [];             // todos los logros (de la base)
const logrosObtenidos = new Set();   // ids de los que ya tiene este usuario

// ---------- CALCULOS ----------
function calcularCosto(base, aumento, comprados) {
  return Math.ceil(base * Math.pow(aumento, comprados));
}

function recalcularValorClick() {
  valorPorClick = (1 + dedoRapidoComprado) * Math.pow(2, dobleClickComprado);
}

function recalcularCostos() {
  costoMejora1 = calcularCosto(BASE_MEJORA1, AUMENTO_MEJORA1, dedoRapidoComprado);
  costoMejora2 = calcularCosto(BASE_MEJORA2, AUMENTO_MEJORA2, ayudanteComprado);
  costoMejora3 = calcularCosto(BASE_MEJORA3, AUMENTO_MEJORA3, dobleClickComprado);
}

function mejorasCompradasTotal() {
  return dedoRapidoComprado + ayudanteComprado + dobleClickComprado;
}

// ---------- PANTALLA ----------
function actualizarContador() {
  contadorPuntos.textContent = puntos;
  actualizarDisponibilidad();
}

// deshabilita los botones que no se pueden pagar
function actualizarDisponibilidad() {
  botonMejora1.disabled = puntos < costoMejora1;
  botonMejora2.disabled = puntos < costoMejora2;
  botonMejora3.disabled = puntos < costoMejora3;
}

// pone en el html el costo real y no uno cualquiera
function actualizarBotones() {
  botonMejora1.setAttribute("data-costo", costoMejora1);
  botonMejora2.setAttribute("data-costo", costoMejora2);
  botonMejora3.setAttribute("data-costo", costoMejora3);

  botonMejora1.textContent = `Comprar (${costoMejora1} pts)`;
  botonMejora2.textContent = `Comprar (${costoMejora2} pts)`;
  botonMejora3.textContent = `Comprar (${costoMejora3} pts)`;

  actualizarDisponibilidad();
}

function renderizarLogros() {
  contenedorLogros.innerHTML = "";

  catalogoLogros.forEach(logro => {
    const obtenido = logrosObtenidos.has(logro.id);
    // los logros que todavia no se consiguieron se ven apagados
    const estilo = obtenido
      ? "margin-bottom: 16px;"
      : "margin-bottom: 16px; opacity: 0.35; filter: grayscale(1);";

    contenedorLogros.innerHTML += `
      <article style="${estilo}">
        <div class="logro">
          <img src="${logro.imagen}" alt="${logro.nombre}" class="imagen-logro">
          <h3>${logro.nombre}</h3>
        </div>
        <p>${logro.descripcion}</p>
        <a href="/logros/${logro.id}" class="boton">Ver logro</a>
      </article>
    `;
  });
}

// ---------- GUARDADO (base de datos) ----------
// Las funciones del juego llaman a guardarDatos(); el envio real
// se hace cada pocos segundos en guardarEnServidor().
function guardarDatos() {
  hayCambios = true;
}

function guardarEnServidor() {
  if (!sesion || !partidaCargada || !hayCambios) return;
  hayCambios = false;

  fetch(`/usuarios/${sesion.usuarioID}/progreso`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    keepalive: true, // permite enviar aunque se cierre la pagina
    body: JSON.stringify({
      puntaje: puntos,
      puntosTotales: puntosTotales,
      clicks: clicksTotales,
      puntosPorSegundo: puntosPorSegundo,
      tiempoJugado: tiempoJugado,
      mejoras: {
        1: dedoRapidoComprado,
        2: ayudanteComprado,
        3: dobleClickComprado
      }
    })
  })
    .then(respuesta => {
      if (!respuesta.ok) throw new Error("No se pudo guardar");
      revisarTop1();
    })
    .catch(() => {
      hayCambios = true; // reintenta en el proximo ciclo
    });
}

async function cargarDatos() {
  if (!sesion) return;

  // progreso del usuario
  try {
    const respuesta = await fetch(`/usuarios/${sesion.usuarioID}`);

    if (respuesta.status === 404) {
      cerrarSesion(); // la cuenta ya no existe
      return;
    }

    const datos = await respuesta.json();

    puntos = datos.puntaje;
    puntosTotales = Number(datos.puntos_totales);
    clicksTotales = datos.clicks;
    puntosPorSegundo = datos.puntos_por_segundo;
    tiempoJugado = datos.tiempo_jugado;

    datos.mejoras.forEach(mejora => {
      if (mejora.mejoraID === 1) dedoRapidoComprado = mejora.cantidad;
      if (mejora.mejoraID === 2) ayudanteComprado = mejora.cantidad;
      if (mejora.mejoraID === 3) dobleClickComprado = mejora.cantidad;
    });

    partidaCargada = true;
  } catch (error) {
    console.log("No se pudo cargar la partida", error);
  }

  recalcularValorClick();
  recalcularCostos();
  actualizarBotones();
  actualizarContador();

  // logros (catalogo + los que ya tiene)
  await cargarLogros();
  revisarLogros();
}

async function cargarLogros() {
  try {
    const [respCatalogo, respObtenidos] = await Promise.all([
      fetch("/logros"),
      fetch(`/usuarios/${sesion.usuarioID}/logros`)
    ]);

    catalogoLogros = await respCatalogo.json();
    const obtenidos = await respObtenidos.json();

    obtenidos.forEach(logro => logrosObtenidos.add(logro.id));
    renderizarLogros();
  } catch (error) {
    console.log("No se pudieron cargar los logros", error);
  }
}

// ---------- LOGROS: condiciones para desbloquear ----------
function otorgarLogro(logroID) {
  if (!partidaCargada || logrosObtenidos.has(logroID)) return;

  logrosObtenidos.add(logroID); // se marca ya para no enviarlo dos veces
  renderizarLogros();

  fetch(`/usuarios/${sesion.usuarioID}/logros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logroID: logroID })
  }).catch(() => {
    logrosObtenidos.delete(logroID); // si fallo, se vuelve a intentar despues
    renderizarLogros();
  });
}

function revisarLogros() {
  if (clicksTotales >= 1) otorgarLogro(1);              // primer click
  if (mejorasCompradasTotal() >= 1) otorgarLogro(2);    // primera mejora
  if (clicksTotales >= 100) otorgarLogro(3);            // 100 clicks
  if (clicksTotales >= 500) otorgarLogro(4);            // 500 clicks
}

// Logro 5: estar primero en la leaderboard
async function revisarTop1() {
  if (logrosObtenidos.has(5)) return;

  try {
    const respuesta = await fetch("/leaderboard");
    const filas = await respuesta.json();

    if (filas.length > 0 && filas[0].nombre === sesion.nombre) {
      otorgarLogro(5);
    }
  } catch (error) {
    // no pasa nada, se vuelve a revisar en el proximo guardado
  }
}

// ---------- JUEGO ----------
function sumarPuntos(cantidad) {
  puntos += cantidad;
  puntosTotales += cantidad;
  actualizarContador();
  guardarDatos();
}

botonClick.addEventListener("click", function () {
  if (!partidaCargada) return; // espera a que cargue la partida
  clicksTotales++;
  sumarPuntos(valorPorClick);
  revisarLogros();
});

//comprar mejora 1//
botonMejora1.addEventListener("click", function () {
  if (puntos >= costoMejora1) {
    puntos = puntos - costoMejora1;
    dedoRapidoComprado++;

    recalcularValorClick();
    recalcularCostos();
    actualizarBotones();
    actualizarContador();
    guardarDatos();
    revisarLogros();
  }
});

//comprar mejora 2//
botonMejora2.addEventListener("click", function () {
  if (puntos >= costoMejora2) {
    puntos = puntos - costoMejora2;
    puntosPorSegundo = puntosPorSegundo + 1;
    ayudanteComprado++;

    recalcularCostos();
    actualizarBotones();
    actualizarContador();
    guardarDatos();
    revisarLogros();
  }
});

//comprar mejora 3//
botonMejora3.addEventListener("click", function () {
  if (puntos >= costoMejora3) {
    puntos = puntos - costoMejora3;
    dobleClickComprado++;

    recalcularValorClick();
    recalcularCostos();
    actualizarBotones();
    actualizarContador();
    guardarDatos();
    revisarLogros();
  }
});

// puntos por segundo
setInterval(function () {
  if (partidaCargada && puntosPorSegundo > 0) {
    sumarPuntos(puntosPorSegundo);
  }
}, 1000);

// tiempo jugado
setInterval(function () {
  if (partidaCargada) {
    tiempoJugado++;
    guardarDatos();
  }
}, 1000);

// guardado automatico en la base de datos cada 10 segundos
setInterval(guardarEnServidor, 10000);

// guardar al salir o cambiar de pestaña
window.addEventListener("pagehide", guardarEnServidor);
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") {
    guardarEnServidor();
  }
});

cargarDatos();