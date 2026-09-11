//comienzo de variables//
let puntos = 0;
let valorPorClick = 1;
let puntosPorSegundo = 0;

// contadores de "veces comprada" (ya no son candado)
let dedoRapidoComprado = 0;
let ayudanteComprado = 0;
let dobleClickComprado = 0;

let contadorPuntos = document.getElementById("contadorPuntos");
let botonClick = document.getElementById("botonClick");

let botonMejora1 = document.getElementById("mejora1");
let botonMejora2 = document.getElementById("mejora2");
let botonMejora3 = document.getElementById("mejora3");

// costos actuales de cada mejora (arrancan leyendo el data-costo del HTML)
let costoMejora1 = parseInt(botonMejora1.getAttribute("data-costo"));
let costoMejora2 = parseInt(botonMejora2.getAttribute("data-costo"));
let costoMejora3 = parseInt(botonMejora3.getAttribute("data-costo"));

// porcentajes de aumento por cada compra
const AUMENTO_MEJORA1 = 1.05; // sube 10% cada vez
const AUMENTO_MEJORA2 = 0.5; // sube 2% cada vez
const AUMENTO_MEJORA3 = 1.50; // sube 1500% cada vez
//fin de variables//

//local storage//
const CLAVE_GUARDADO = "clickaverityguardado";

function guardarDatos() {
  let datos = {
    puntos: puntos,
    valorPorClick: valorPorClick,
    puntosPorSegundo: puntosPorSegundo,
    dedoRapidoComprado: dedoRapidoComprado,
    ayudanteComprado: ayudanteComprado,
    dobleClickComprado: dobleClickComprado,
    costoMejora1: costoMejora1,
    costoMejora2: costoMejora2,
    costoMejora3: costoMejora3
  };

  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
}

function cargarDatos() {
  let datosGuardados = localStorage.getItem(CLAVE_GUARDADO);

  if (!datosGuardados) {
    actualizarBotones();
    return; 
  }

  let datos = JSON.parse(datosGuardados);

  puntos = datos.puntos;
  valorPorClick = datos.valorPorClick;
  puntosPorSegundo = datos.puntosPorSegundo;
  dedoRapidoComprado = datos.dedoRapidoComprado || 0;
  ayudanteComprado = datos.ayudanteComprado || 0;
  dobleClickComprado = datos.dobleClickComprado || 0;

  if (datos.costoMejora1 !== undefined) costoMejora1 = datos.costoMejora1;
  if (datos.costoMejora2 !== undefined) costoMejora2 = datos.costoMejora2;
  if (datos.costoMejora3 !== undefined) costoMejora3 = datos.costoMejora3;

  actualizarBotones();
  actualizarContador();
}

function actualizarContador() {
  contadorPuntos.textContent = puntos;
}

// pinta en el HTML el costo real que hay en JS (fuente de verdad)
function actualizarBotones() {
  costoMejora1 = Math.floor(costoMejora1);
  costoMejora2 = Math.floor(costoMejora2);
  costoMejora3 = Math.floor(costoMejora3);

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

    costoMejora1 = costoMejora1 * (1 + AUMENTO_MEJORA1);

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

    costoMejora2 = costoMejora2 * (1 + AUMENTO_MEJORA2);

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

    costoMejora3 = costoMejora3 * (1 + AUMENTO_MEJORA3);

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