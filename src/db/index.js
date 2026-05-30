import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DBHOST?.trim(),
    user: process.env.DBUSERNAME?.trim(),
    password: process.env.DBPASSWORD?.trim(),
    database: process.env.DATABASE?.trim(),
    port: Number(process.env.DBPORT) || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: true }
});

pool.getConnection()
    .then(conn => {
        console.log('Connected to database successfully');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });

export default pool;
