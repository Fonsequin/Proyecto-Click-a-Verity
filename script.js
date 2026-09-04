var puntos = 0;
var valorPorClick = 1;
var puntosPorSegundo = 0;

var dedoRapidoComprado = false;
var ayudanteComprado = false;
var dobleClickComprado = false;

var contadorPuntos = document.getElementById("contadorPuntos");
var botonClick = document.getElementById("botonClick");

var botonMejora1 = document.getElementById("mejora1");
var botonMejora2 = document.getElementById("mejora2");
var botonMejora3 = document.getElementById("mejora3");

function actualizarContador() {
  contadorPuntos.textContent = puntos;
}

function sumarPuntos(cantidad) {
  puntos = puntos + cantidad;
  actualizarContador();
}

botonClick.addEventListener("click", function () {
  sumarPuntos(valorPorClick);
});

botonMejora1.addEventListener("click", function () {
  var costo = parseInt(botonMejora1.getAttribute("data-costo"));

  if (dedoRapidoComprado === true) {
    return;
  }

  if (puntos >= costo) {
    puntos = puntos - costo;
    valorPorClick = 2;
    dedoRapidoComprado = true;
    botonMejora1.textContent = "Comprada";
    botonMejora1.disabled = true;
    actualizarContador();
  }
});

botonMejora2.addEventListener("click", function () {
  var costo = parseInt(botonMejora2.getAttribute("data-costo"));

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
  }
});

botonMejora3.addEventListener("click", function () {
  var costo = parseInt(botonMejora3.getAttribute("data-costo"));

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
  }
});

setInterval(function () {
  if (puntosPorSegundo > 0) {
    sumarPuntos(puntosPorSegundo);
  }
}, 1000);
