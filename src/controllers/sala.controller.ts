import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

// OBTENER TODAS LAS SALAS
export const getSalas = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM salas ORDER BY id ASC;');
        return res.json(result.rows);
    } catch (error) {
        console.error("ERROR EN POSTGRESQL (GET SALAS):", error);
        return res.status(500).json({ message: 'Error al consultar las salas', error });
    }
};

export const createSala = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;

        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ message: 'Error: El campo nombre es obligatorio y debe ser texto.' });
        }

        const query = 'INSERT INTO salas (nombre) VALUES ($1) RETURNING *;';
        const result = await pool.query(query, [nombre]);
        return res.status(201).json({ message: 'Sala creada con éxito en PostgreSQL', sala: result.rows[0] });
    } catch (error) {
        console.error("ERROR EN POSTGRESQL (POST SALA):", error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Error: El nombre de la sala ya se encuentra registrado.' });
        }
        return res.status(500).json({ message: 'Error al registrar la sala', error: error instanceof Error ? error.message : error });
    }
};

// actualizar sala por ID
export const updateSala = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ message: 'Error: El campo nombre es requerido para actualizar.' });
        }

        const query = 'UPDATE salas SET nombre = $1 WHERE id = $2 RETURNING *;';
        const result = await pool.query(query, [nombre, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Error: La sala con ID ${id} no existe.` });
        }

        return res.json({ message: 'Sala actualizada con éxito', sala: result.rows[0] });
    } catch (error) {
        console.error(" ERROR EN POSTGRESQL (PUT SALA):", error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Error: Ese nombre de sala ya está ocupado por otra.' });
        }
        return res.status(500).json({ message: 'Error al actualizar la sala', error });
    }
};

// 4. eliminar sala por ID
export const deleteSala = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM salas WHERE id = $1 RETURNING *;';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Error: La sala con ID ${id} no existe.` });
        }

        return res.json({ message: 'Sala eliminada correctamente' });
    } catch (error) {
        console.error("ERROR EN POSTGRESQL (DELETE SALA):", error);
        return res.status(500).json({ message: 'Error al eliminar la sala', error });
    }
};
