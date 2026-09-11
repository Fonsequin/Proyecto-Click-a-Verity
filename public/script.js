//comienzo de variables//
let puntos = 0;
let valorPorClick = 1;
let puntosPorSegundo = 0;

// cantidad de veces que se compró cada mejora
let dedoRapidoComprado = 0;
let ayudanteComprado = 0;
let dobleClickComprado = 0;

let contadorPuntos = document.getElementById("contadorPuntos");
let botonClick = document.getElementById("botonClick");

let botonMejora1 = document.getElementById("mejora1");
let botonMejora2 = document.getElementById("mejora2");
let botonMejora3 = document.getElementById("mejora3");

// costos BASE (el precio de la primera compra, tal cual estaba en el HTML)
const BASE_MEJORA1 = parseInt(botonMejora1.getAttribute("data-costo"));
const BASE_MEJORA2 = parseInt(botonMejora2.getAttribute("data-costo"));
const BASE_MEJORA3 = parseInt(botonMejora3.getAttribute("data-costo"));

// porcentaje de aumento POR COMPRA (estilo Cookie Clicker, no se dispara)
const AUMENTO_MEJORA1 = 0.15; // +15% por compra
const AUMENTO_MEJORA2 = 0.13; // +13% por compra
const AUMENTO_MEJORA3 = 0.35; // +35% por compra (crece más rápido que las otras, pero no explota)

// costos actuales, se recalculan cada vez con calcularCosto()
let costoMejora1, costoMejora2, costoMejora3;
//fin de variables//

//local storage//
const CLAVE_GUARDADO = "clickaverityguardado";

function calcularCosto(base, aumento, vecesComprada) {
  return Math.floor(base * Math.pow(1 + aumento, vecesComprada));
}

function guardarDatos() {
  let datos = {
    puntos: puntos,
    valorPorClick: valorPorClick,
    puntosPorSegundo: puntosPorSegundo,
    dedoRapidoComprado: dedoRapidoComprado,
    ayudanteComprado: ayudanteComprado,
    dobleClickComprado: dobleClickComprado
  };

  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
}

function cargarDatos() {
  let datosGuardados = localStorage.getItem(CLAVE_GUARDADO);

  if (datosGuardados) {
    let datos = JSON.parse(datosGuardados);

    puntos = datos.puntos;
    valorPorClick = datos.valorPorClick;
    puntosPorSegundo = datos.puntosPorSegundo;
    dedoRapidoComprado = datos.dedoRapidoComprado || 0;
    ayudanteComprado = datos.ayudanteComprado || 0;
    dobleClickComprado = datos.dobleClickComprado || 0;
  }

  recalcularCostos();
  actualizarBotones();
  actualizarContador();
}

function recalcularCostos() {
  costoMejora1 = calcularCosto(BASE_MEJORA1, AUMENTO_MEJORA1, dedoRapidoComprado);
  costoMejora2 = calcularCosto(BASE_MEJORA2, AUMENTO_MEJORA2, ayudanteComprado);
  costoMejora3 = calcularCosto(BASE_MEJORA3, AUMENTO_MEJORA3, dobleClickComprado);
}

function actualizarContador() {
  contadorPuntos.textContent = puntos;
}

// pinta en el HTML el costo real que hay en JS (fuente de verdad)
function actualizarBotones() {
  botonMejora1.setAttribute("data-costo", costoMejora1);
  botonMejora2.setAttribute("data-costo", costoMejora2);
  botonMejora3.setAttribute("data-costo", costoMejora3);

  botonMejora1.textContent = `Comprar (${costoMejora1} pts)`;
  botonMejora2.textContent = `Comprar (${costoMejora2} pts)`;
  botonMejora3.textContent = `Comprar (${costoMejora3} pts)`;
}

function sumarPuntos(cantidad) {
  puntos += cantidad;
  actualizarContador();
  guardarDatos();
}

botonClick.addEventListener("click", function () {
  sumarPuntos(valorPorClick);
});

//comprar mejora 1//
botonMejora1.addEventListener("click", function () {
  if (puntos >= costoMejora1) {
    puntos = puntos - costoMejora1;
    valorPorClick += 1;
    dedoRapidoComprado++;

    recalcularCostos();
    actualizarBotones();
    actualizarContador();
    guardarDatos();
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
  }
});

//comprar mejora 3//
botonMejora3.addEventListener("click", function () {
  if (puntos >= costoMejora3) {
    puntos = puntos - costoMejora3;
    valorPorClick = valorPorClick * 2;
    dobleClickComprado++;

    recalcularCostos();
    actualizarBotones();
    actualizarContador();
    guardarDatos();
  }
});


setInterval(function () {
  if (puntosPorSegundo > 0) {
    sumarPuntos(puntosPorSegundo);
  }
}, 1000);

//guardado automatico despues de dos mins
setInterval(function () {
  guardarDatos();
}, 120000); 


cargarDatos();