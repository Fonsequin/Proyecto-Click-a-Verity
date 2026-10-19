
  };

  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
}

function cargarDatos() {
  let datosGuardados = localStorage.getItem(CLAVE_GUARDADO);

  if (datosGuardados) {
    let datos = JSON.parse(datosGuardados);

    puntos = datos.puntos;
    puntosPorSegundo = datos.puntosPorSegundo;
    dedoRapidoComprado = datos.dedoRapidoComprado || 0;
    ayudanteComprado = datos.ayudanteComprado || 0;
    dobleClickComprado = datos.dobleClickComprado || 0;
  }

  recalcularValorClick();
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

// pone en el html el costo real y no uno cualquiera
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
    dedoRapidoComprado++;

    recalcularValorClick();
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
    dobleClickComprado++;

    recalcularValorClick();
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

const contenedor = document.querySelector("#logros");

fetch("/logros")
    .then(respuesta => respuesta.json())
    .then(datos => {

        datos.forEach(logro => {
            contenedor.innerHTML += `
                <article>
                    <div class="logro">
                      <img src="${logro.imagen}" alt="${logro.nombre}"class="imagen-logro">
                      <h3>${logro.nombre}</h3>
                    </div>
                    <p>${logro.descripcion}</p>
                    <a href="/logros/${logro.id}" class="boton">Ver logro</a>
                    <br></br>
                </article>
            `;
        });

    });

cargarDatos();


//funcionamiento del login
//falta completar el funcionamiento del login. Referencia en GitHub: susering
const inputsLogin = document.querySelectorAll(".login");

