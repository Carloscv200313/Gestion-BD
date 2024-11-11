// utils/dbConnect.js
import sql from 'mssql';

// Configura los detalles de tu base de datos
const config = {
    user: process.env.DB_USER,        // Usuario de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña del usuario
    server: process.env.DB_SERVER,    // Nombre del servidor o dirección IP
    database: process.env.DB_DATABASE, // Nombre de la base de datos
    options: {
        encrypt: true,                  // Usar encriptación (para Azure SQL)
        trustServerCertificate: true,    // Usar solo si estás conectando localmente
    },
};

let pool;

export async function Conex() {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('Conectado a SQL Server');
        } catch (err) {
            console.error('Error conectando a la base de datos', err);
        }
    }
    return pool;
}
