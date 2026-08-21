import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

export const getRutas = async (req: Request, res: Response) => {
    try {
        // Usamos INNER JOIN para unir la tabla de rutas (tls)
        const query = `
            SELECT r.id, r.nombre, r.tipo, r.created_at, t.nombre AS trainer_nombre, t.cargo AS trainer_cargo
            FROM rutas r
            INNER JOIN tls t ON r.tl_id = t.id
            ORDER BY r.id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar las rutas de los TLs', error });
    }
};

export const createRuta = async (req: Request, res: Response) => {
    try {
        const { nombre, tipo, tl_id } = req.body;

        if (!nombre || !tipo || !tl_id) {
            return res.status(400).json({ message: 'Error: Los campos nombre, tipo (basica/avanzada) y tl_id son obligatorios.' });
        }

        if (tipo !== 'basica' && tipo !== 'avanzada') {
            return res.status(400).json({ message: "Error: El tipo de ruta debe ser estrictamente 'basica' o 'avanzada'." });
        }

        // Verificar primero si el TL existe
        const tlCheck = await pool.query('SELECT id FROM tls WHERE id = $1;', [tl_id]);
        if (tlCheck.rows.length === 0) {
            return res.status(404).json({ message: `Error: El Trainer con ID ${tl_id} no existe en el sistema.` });
        }

        // Insertar la ruta de forma segura
        const query = 'INSERT INTO rutas (nombre, tipo, tl_id) VALUES ($1, $2, $3) RETURNING *;';
        const values = [nombre, tipo, tl_id];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Ruta creada y asignada al Trainer con éxito', ruta: result.rows[0] });
    } catch (error) {
    console.error("❌ ERROR DETALLADO EN POSTGRESQL (RUTAS):", error);
    
    return res.status(500).json({ 
        message: 'Error al registrar la ruta', 
        error: error instanceof Error ? error.message : error 
    });
}
};
