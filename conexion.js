require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true 
});

// iniciar //
pool.getConnection((error, conexion) => {
    if (error) {
        console.log("Error de conexión:", error.message);
        return;
    }

    console.log("Conectado a MySQL");
    conexion.release();
});


module.exports = pool.promise();