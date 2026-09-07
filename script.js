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
  let costo = parseInt(botonMejora1.getAttribute("data-costo"));

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
  }
});

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
  }
});

setInterval(function () {
  if (puntosPorSegundo > 0) {
    sumarPuntos(puntosPorSegundo);
  }
}, 1000);
