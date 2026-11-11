const express = require("express");
const bcrypt = require("bcryptjs");
const conexion = require("./conexion");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// ---------- LOGROS ----------
// Mismo formato que antes (id, nombre, descripcion, imagen) para no romper script.js
app.get("/logros", async (solicitud, respuesta) => {
    try {
        const [filas] = await conexion.query(
            `SELECT logroID AS id, logronombre AS nombre, logrodesc AS descripcion, imagen
             FROM logros ORDER BY logroID`
        );
        respuesta.json(filas);
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

app.get("/logros/:id", async (solicitud, respuesta) => {
    try {
        const [filas] = await conexion.query(
            `SELECT logroID AS id, logronombre AS nombre, logrodesc AS descripcion, imagen
             FROM logros WHERE logroID = ?`,
            [Number(solicitud.params.id)]
        );
        if (filas.length === 0) {
            return respuesta.status(404).json({ mensaje: "Logro no encontrado" });
        }
        respuesta.json(filas[0]);
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// Logros que ya desbloqueo un usuario
app.get("/usuarios/:id/logros", async (solicitud, respuesta) => {
    try {
        const [filas] = await conexion.query(
            `SELECT l.logroID AS id, l.logronombre AS nombre, l.logrodesc AS descripcion,
                    l.imagen, ul.fecha_obtenido
             FROM usuarios_logros ul
             JOIN logros l ON l.logroID = ul.logroID
             WHERE ul.usuarioID = ?`,
            [Number(solicitud.params.id)]
        );
        respuesta.json(filas);
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// Dar un logro a un usuario (si ya lo tiene, no hace nada)
app.post("/usuarios/:id/logros", async (solicitud, respuesta) => {
    try {
        await conexion.query(
            "INSERT IGNORE INTO usuarios_logros (usuarioID, logroID) VALUES (?, ?)",
            [Number(solicitud.params.id), Number(solicitud.body.logroID)]
        );
        respuesta.json({ mensaje: "Logro registrado" });
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// ---------- REGISTRO / LOGIN ----------
app.post("/registro", async (solicitud, respuesta) => {
    try {
        const { nombre, contrasena } = solicitud.body;

        if (typeof nombre !== "string" || typeof contrasena !== "string" ||
            nombre.length < 3 || nombre.length > 25 ||
            contrasena.length < 4 || contrasena.length > 72) {
            return respuesta.status(400).json({ mensaje: "Datos invalidos" });
        }

        const [existe] = await conexion.query(
            "SELECT usuarioID FROM usuarios WHERE nombre = ?", [nombre]
        );
        if (existe.length > 0) {
            return respuesta.status(409).json({ mensaje: "Ese usuario ya existe" });
        }

        const hash = await bcrypt.hash(contrasena, 10);
        const [resultado] = await conexion.query(
            "INSERT INTO usuarios (nombre, contrasena, fecha) VALUES (?, ?, CURDATE())",
            [nombre, hash]
        );

        respuesta.status(201).json({ usuarioID: resultado.insertId, nombre });
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

app.post("/login", async (solicitud, respuesta) => {
    try {
        const { nombre, contrasena } = solicitud.body;

        if (typeof nombre !== "string" || typeof contrasena !== "string") {
            return respuesta.status(400).json({ mensaje: "Faltan datos" });
        }

        const [filas] = await conexion.query(
            "SELECT usuarioID, nombre, contrasena FROM usuarios WHERE nombre = ?",
            [nombre]
        );
        if (filas.length === 0) {
            return respuesta.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        const coincide = await bcrypt.compare(contrasena, filas[0].contrasena);
        if (!coincide) {
            return respuesta.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        respuesta.json({ usuarioID: filas[0].usuarioID, nombre: filas[0].nombre });
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// ---------- PERFIL / PROGRESO ----------
// Datos del usuario + mejoras compradas (sirve para usuario.html, estadisticas.html y cargar partida)
app.get("/usuarios/:id", async (solicitud, respuesta) => {
    try {
        const id = Number(solicitud.params.id);

        const [usuarios] = await conexion.query(
            `SELECT usuarioID, nombre, fecha, puntaje, puntos_totales, clicks,
                    puntos_por_segundo, tiempo_jugado
             FROM usuarios WHERE usuarioID = ?`,
            [id]
        );
        if (usuarios.length === 0) {
            return respuesta.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const [mejoras] = await conexion.query(
            "SELECT mejoraID, cantidad FROM usuarios_mejoras WHERE usuarioID = ?",
            [id]
        );

        respuesta.json({ ...usuarios[0], mejoras });
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// Guardar progreso
// body: { puntaje, puntosTotales, clicks, puntosPorSegundo, tiempoJugado,
//         mejoras: { "1": 2, "2": 1, "3": 0 } }
app.put("/usuarios/:id/progreso", async (solicitud, respuesta) => {
    try {
        const id = Number(solicitud.params.id);
        const { puntaje, puntosTotales, clicks, puntosPorSegundo, tiempoJugado, mejoras } = solicitud.body;
        const entero = valor => Math.max(0, Math.floor(Number(valor)) || 0);

        await conexion.query(
            `UPDATE usuarios
             SET puntaje = ?, puntos_totales = ?, clicks = ?,
                 puntos_por_segundo = ?, tiempo_jugado = ?
             WHERE usuarioID = ?`,
            [entero(puntaje), entero(puntosTotales), entero(clicks), entero(puntosPorSegundo), entero(tiempoJugado), id]
        );

        for (const [mejoraID, cantidad] of Object.entries(mejoras || {})) {
            await conexion.query(
                `INSERT INTO usuarios_mejoras (usuarioID, mejoraID, cantidad)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
                [id, Number(mejoraID), entero(cantidad)]
            );
        }

        respuesta.json({ mensaje: "Progreso guardado" });
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// ---------- ESTADISTICAS DE UN USUARIO ----------
// Todo sale de la base de datos: datos del usuario, mejoras, logros y puesto en el ranking
app.get("/usuarios/:id/estadisticas", async (solicitud, respuesta) => {
    try {
        const id = Number(solicitud.params.id);

        const [usuarios] = await conexion.query(
            `SELECT usuarioID, nombre, puntaje, puntos_totales, clicks,
                    puntos_por_segundo, tiempo_jugado
             FROM usuarios WHERE usuarioID = ?`,
            [id]
        );
        if (usuarios.length === 0) {
            return respuesta.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        const usuario = usuarios[0];

        const [mejoras] = await conexion.query(
            "SELECT mejoraID, cantidad FROM usuarios_mejoras WHERE usuarioID = ?",
            [id]
        );

        const [[logros]] = await conexion.query(
            "SELECT COUNT(*) AS total FROM usuarios_logros WHERE usuarioID = ?", [id]
        );
        const [[totalLogros]] = await conexion.query("SELECT COUNT(*) AS total FROM logros");

        // mismo criterio de orden que el leaderboard (puntos totales y, si empatan, el mas antiguo)
        const [[puesto]] = await conexion.query(
            `SELECT COUNT(*) + 1 AS puesto FROM usuarios
             WHERE puntos_totales > ? OR (puntos_totales = ? AND usuarioID < ?)`,
            [usuario.puntos_totales, usuario.puntos_totales, id]
        );
        const [[jugadores]] = await conexion.query("SELECT COUNT(*) AS total FROM usuarios");

        respuesta.json({
            ...usuario,
            mejoras,
            mejoras_compradas: mejoras.reduce((suma, m) => suma + m.cantidad, 0),
            logros_desbloqueados: Number(logros.total),
            total_logros: Number(totalLogros.total),
            puesto: Number(puesto.puesto),
            total_jugadores: Number(jugadores.total)
        });
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

// ---------- LEADERBOARD ----------
// El top 1 es quien mas puntos_totales acumulo en toda su partida
app.get("/leaderboard", async (solicitud, respuesta) => {
    try {
        const [filas] = await conexion.query(
            `SELECT usuarioID, nombre, puntos_totales
             FROM usuarios
             ORDER BY puntos_totales DESC, usuarioID ASC
             LIMIT 10`
        );
        respuesta.json(filas);
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ mensaje: "Error del servidor" });
    }
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000 ");
});