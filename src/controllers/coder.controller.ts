import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

// 1. OBTENER TODOS LOS CODERS CON SU CLAN ASOCIADO (INNER JOIN)
export const getCoders = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT co.id, co.nombre, co.email, co.estado, co.created_at, cl.nombre AS clan_nombre
            FROM coders co
            INNER JOIN clanes cl ON co.clan_id = cl.id
            ORDER BY co.id ASC;
        `;
        const result = await pool.query(query);
        return res.json(result.rows);
    } catch (error) {
        console.error("❌ ERROR EN POSTGRESQL (GET CODERS):", error);
        return res.status(500).json({ message: 'Error al consultar los estudiantes', error });
    }
};

export const createCoder = async (req: Request, res: Response) => {
    try {
        const { nombre, email, estado, clan_id } = req.body;

        if (!nombre || !email || !estado || !clan_id) {
            return res.status(400).json({ message: 'Error: Los campos nombre, email, estado y clan_id son obligatorios.' });
        }

        if (estado !== 'activo' && estado !== 'inactivo' && estado !== 'graduado') {
            return res.status(400).json({ message: "Error: El estado debe ser estrictamente 'activo', 'inactivo' o 'graduado'." });
        }

        const clanCheck = await pool.query('SELECT id FROM clanes WHERE id = $1;', [clan_id]);
        if (clanCheck.rows.length === 0) {
            return res.status(404).json({ message: `Error: El Clan con ID ${clan_id} no existe en el sistema. Primero debes crearlo.` });
        }

        const query = 'INSERT INTO coders (nombre, email, estado, clan_id) VALUES ($1, $2, $3, $4) RETURNING *;';
        const values = [nombre, email, estado, clan_id];

        const result = await pool.query(query, values);
        return res.status(201).json({ message: 'Coder registrado con éxito en tu cohorte', coder: result.rows[0] });

    } catch (error) {
        console.error("❌ ERROR EN POSTGRESQL (POST CODER):", error);
        // Capturar si el email ya existe debido a la restricción UNIQUE de la tabla
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Error: El correo electrónico ya se encuentra registrado por otro estudiante.' });
        }
        return res.status(500).json({ message: 'Error al registrar al coder', error: error instanceof Error ? error.message : error });
    }
};
