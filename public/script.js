//comienzo de variables//
let puntos = 0;
let valorPorClick = 1;
let puntosPorSegundo = 0;

let dedoRapidoComprado = false;
let ayudanteComprado = false;
let dobleClickComprado = false;

let contadorPuntos = document.getElementById("contadorPuntos");
let botonClick = document.getElementById("botonClick");

let botonMejora1 = document.getElementById("mejora1");
let botonMejora2 = document.getElementById("mejora2");
let botonMejora3 = document.getElementById("mejora3");
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
    dobleClickComprado: dobleClickComprado
  };

  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
}

function cargarDatos() {
  let datosGuardados = localStorage.getItem(CLAVE_GUARDADO);

  if (!datosGuardados) {
    return; 
  }

  let datos = JSON.parse(datosGuardados);

  puntos = datos.puntos;
  valorPorClick = datos.valorPorClick;
  puntosPorSegundo = datos.puntosPorSegundo;
  dedoRapidoComprado = datos.dedoRapidoComprado;
  ayudanteComprado = datos.ayudanteComprado;
  dobleClickComprado = datos.dobleClickComprado;

  if (dedoRapidoComprado === true) {
    botonMejora1.textContent = "Comprada";
    botonMejora1.disabled = true;
  }

  if (ayudanteComprado === true) {
    botonMejora2.textContent = "Comprada";
    botonMejora2.disabled = true;
  }

  if (dobleClickComprado === true) {
    botonMejora3.textContent = "Comprada";
    botonMejora3.disabled = true;
  }

  actualizarContador();
}

function actualizarContador() {
  contadorPuntos.textContent = puntos;
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
  let costo = parseInt(botonMejora1.getAttribute("data-costo"));

  if (dedoRapidoComprado === true) {
    return;
  }

  if (puntos >= costo) {
    puntos = puntos - costo;
    valorPorClick += 1;
    dedoRapidoComprado = true;
    botonMejora1.textContent = "Comprada";
    botonMejora1.disabled = true;
    actualizarContador();
    guardarDatos();
  }
});

//comprar mejora 2//
botonMejora2.addEventListener("click", function () {
  let costo = parseInt(botonMejora2.getAttribute("data-costo"));

  if (ayudanteComprado === true) {
    return;
  }

  if (puntos >= costo) {
    puntos = puntos - costo;
    puntosPorSegundo = puntosPorSegundo + 1;
    ayudanteComprado = true;
    botonMejora2.textContent = "Comprada";
    botonMejora2.disabled = true;
    actualizarContador();
    guardarDatos();
  }
});

//comprar mejora 3//
botonMejora3.addEventListener("click", function () {
  let costo = parseInt(botonMejora3.getAttribute("data-costo"));

  if (dobleClickComprado === true) {
    return;
  }

  if (puntos >= costo) {
    puntos = puntos - costo;
    valorPorClick = valorPorClick * 2;
    dobleClickComprado = true;
    botonMejora3.textContent = "Comprada";
    botonMejora3.disabled = true;
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