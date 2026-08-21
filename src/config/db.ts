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
        console.log('[Database] ¡Conexión nativa a PostgreSQL establecida con éxito!');
        
        // 1. CREACIÓN DE LA TABLA DE TLs
        await client.query(`
            CREATE TABLE IF NOT EXISTS tls (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                cargo VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. CREACIÓN DE LA TABLA DE RUTAS
        await client.query(`
            CREATE TABLE IF NOT EXISTS rutas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) UNIQUE NOT NULL,
                tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('basica', 'avanzada')),
                tl_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tl_id) REFERENCES tls(id) ON DELETE CASCADE
            );
        `);

        // 3. CREACIÓN DE LA TABLA DE SALAS
        await client.query(`
            CREATE TABLE IF NOT EXISTS salas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. CREACIÓN DE LA TABLA DE CLANES CON ENLACE A SALAS
        await client.query(`
            CREATE TABLE IF NOT EXISTS clanes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) UNIQUE NOT NULL,
                ruta_id INT NOT NULL,
                sala_id INT, -- <-- Llave foránea para la sala física
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE,
                FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
            );
        `);

        // 5. CREACIÓN DE LA TABLA DE CODERS
        await client.query(`
            CREATE TABLE IF NOT EXISTS coders (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                estado VARCHAR(20) NOT NULL CHECK (estado IN ('activo', 'inactivo', 'graduado')),
                clan_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (clan_id) REFERENCES clanes(id) ON DELETE CASCADE
            );
        `);

        console.log('[Database] Las 5 tablas relacionales oficiales se crearon físicamente con éxito.');
        client.release();
    } catch (error) {
        console.error('[Database Error] Fallo crítico al inicializar las tablas:', error);
        process.exit(1);
    }
};
