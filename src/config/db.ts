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
        console.log('[Database] ¡Conexión nativa establecida con éxito!');
        
        // 1. TABLA DE CIUDADES (MEDELLÍN Y BARRANQUILLA)
        await client.query(`
            CREATE TABLE IF NOT EXISTS ciudades (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. TABLA DE PROFESORES CON ENLACE A CIUDAD
        await client.query(`
            CREATE TABLE IF NOT EXISTS tls (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                cargo VARCHAR(100) NOT NULL,
                ciudad_id INT, -- <-- Llave foránea para la ciudad
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ciudad_id) REFERENCES ciudades(id) ON DELETE SET NULL
            );
        `);

        // 3. TABLA RUTAS
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

        // 4. TABLA DE SALAS
        await client.query(`
            CREATE TABLE IF NOT EXISTS salas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. TABLA DE CLANES CON ENLACE A SALAS
        await client.query(`
            CREATE TABLE IF NOT EXISTS clanes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) UNIQUE NOT NULL,
                ruta_id INT NOT NULL,
                sala_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE,
                FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
            );
        `);

        // 6. TABLA DE ESTUDIANTES CON ENLACE A CIUDAD
        await client.query(`
            CREATE TABLE IF NOT EXISTS coders (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                estado VARCHAR(20) NOT NULL CHECK (estado IN ('activo', 'inactivo', 'graduado')),
                clan_id INT NOT NULL,
                ciudad_id INT, -- <-- Llave foránea para la ciudad
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (clan_id) REFERENCES clanes(id) ON DELETE CASCADE,
                FOREIGN KEY (ciudad_id) REFERENCES ciudades(id) ON DELETE SET NULL
            );
        `);

        console.log('[Database] tablas relacionales se crearon físicamente con éxito.');
        client.release();
    } catch (error) {
        console.error('[Database Error] Fallo crítico al inicializar las tablas:', error);
        process.exit(1);
    }
};
