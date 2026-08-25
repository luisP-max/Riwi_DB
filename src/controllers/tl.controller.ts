import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

export const getTLs = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM tls ORDER BY created_at DESC;');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar los Team Leaders', error });
    }
};

// Aqui creamos el nuevo TL en riwi vinculandolo a su ciudad UUID de forma segura.
export const createTL = async (req: Request, res: Response) => {
    try {
        const { nombre, cargo, ciudad_id } = req.body;

        if (!nombre || !cargo || !ciudad_id || typeof nombre !== 'string' || typeof cargo !== 'string' || typeof ciudad_id !== 'string') {
            return res.status(400).json({ message: 'Error: Los campos nombre, cargo y ciudad_id son obligatorios.' });
        }

        // Usamos $1, $2 y $3 para inyectar datos de forma segura.
        const query = 'INSERT INTO tls (nombre, cargo, ciudad_id) VALUES ($1, $2, $3) RETURNING *;';
        const values = [nombre, cargo, ciudad_id];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Team Leader creado con éxito', tl: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el TL', error });
    }
};
