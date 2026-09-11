const express = require("express");

const app = express();

app.use(express.static("public"));

const logros = [
{
id: 1,
nombre: "Hacer tu primer click",
descripcion: "Hiciste tu primer click con Verity!",
imagen: "/public/imagenes/logro1.png",
},
{
id: 2,
nombre: "El inicio",
descripcion: "Compraste tu primera mejora con Verity!",
imagen: "/public/imagenes/logro2.png",
},
{
id: 3,
nombre: "100 verities",
descripcion: "Conseguiste 100 clicks!",
imagen: "/public/imagenes/logro3.png",
},
{
id: 4,
nombre: "500 verities",
descripcion:"Conseguiste 500 clicks!",
imagen: "/public/imagenes/logro4.png",
},
{
id: 5,
nombre: "Click a Verity!",
descripcion: "Llegaste al top 1 de la leaderboard!",
imagen: "public/imagenes/logro5.png",
}
];

app.get("/logros", (solicitud, respuesta) => {
respuesta.json(logros);
});

app.get("/logros/:id", (solicitud, respuesta) => {

const id = Number(solicitud.params.id);

const logro = logros.find(logro => logro.id === id);

if (!logro) {
return respuesta.status(404).json({
mensaje: "Logro no encontrado"
});
}

respuesta.json(logro);
});

app.listen(3000, () => {
console.log("Servidor corriendo en http://localhost:3000 ");
});

