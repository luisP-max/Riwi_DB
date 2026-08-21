import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

export const getClanes = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT c.id, c.nombre, c.created_at, r.nombre AS ruta_nombre, r.tipo AS ruta_tipo
            FROM clanes c
            INNER JOIN rutas r ON c.ruta_id = r.id
            ORDER BY c.id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar los clanes', error });
    }
};

export const createClan = async (req: Request, res: Response) => {
    try {
        const { nombre, ruta_id } = req.body;

        if (!nombre || !ruta_id) {
            return res.status(400).json({ message: 'Error: Los campos nombre y ruta_id son obligatorios.' });
        }

        // aca se verifica si primero la Ruta existe
        const rutaCheck = await pool.query('SELECT id FROM rutas WHERE id = $1;', [ruta_id]);
        if (rutaCheck.rows.length === 0) {
            return res.status(404).json({ message: `Error: La Ruta con ID ${ruta_id} no existe en el sistema.` });
        }

        // aqui insertamos el clan
        const query = 'INSERT INTO clanes (nombre, ruta_id) VALUES ($1, $2) RETURNING *;';
        const values = [nombre, ruta_id];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Clan creado y asignado a la ruta con éxito', clan: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el clan', error });
    }
};
