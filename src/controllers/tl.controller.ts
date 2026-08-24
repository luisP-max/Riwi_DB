import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

export const getTLs = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM tls ORDER BY id ASC;');
        res.json(result.rows); 
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar los Team Leaders', error });
    }
};

// aqui creamos el nuevo TL en riwi, tira el error y te tire el aviso de error los campos son obligatorios 

export const createTL = async (req: Request, res: Response) => {
    try {
        const { nombre, cargo } = req.body;

        if (!nombre || !cargo || typeof nombre !== 'string' || typeof cargo !== 'string') {
            return res.status(400).json({ message: 'Error: Los campos nombre y cargo son obligatorios.' });
        }

        // Usamos $1 y $2 para inyectar datos de forma segura sin hackeos
        const query = 'INSERT INTO tls (nombre, cargo) VALUES ($1, $2) RETURNING *;';
        const values = [nombre, cargo];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Team Leader creado con éxito', tl: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el TL', error });
    }
};
