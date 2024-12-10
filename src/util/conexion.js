import sql from 'mssql';
const config = {
    user: process.env.DB_USER,       
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,   
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,                
        trustServerCertificate: true, 
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