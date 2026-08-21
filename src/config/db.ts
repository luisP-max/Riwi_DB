import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
});

export const ConnectDB = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        console.log('[Database] ¡Conexión nativa a PostgreSQL establecida con total éxito!');
        client.release();
    } catch (error) {
        console.error('[Database Error] Fallo crítico al conectar con PostgreSQL:', error);
        process.exit(1);
    }
};
