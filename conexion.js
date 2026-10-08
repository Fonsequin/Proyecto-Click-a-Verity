require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // En caso de usar Workbench poner la contraseña (esta info no la suban a github)
    database: process.env.DB_NAME
});

pool.getConnection((error, conexion) => {
    if (error) {
        console.log("Error de conexión");
        return;
    }

    console.log("Conectado a MySQL");
    conexion.release();
});

module.exports = pool;

