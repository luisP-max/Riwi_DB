import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

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
        console.error("ERROR EN MOSTRAR EL CODER:", error);
        return res.status(500).json({ message: 'Error al consultar los coders', error });
    }
};

export const createCoder = async (req: Request, res: Response) => {
    try {
        const body = req.body as { nombre: string; email: string; telefono: string; estado: string; clan_id: string };
        const { nombre, email, telefono, estado, clan_id } = body;

        if (!nombre || !email || !telefono || !estado || !clan_id) {
            return res.status(400).json({ message: 'Error: Los campos nombre, email, telefono, estado y clan_id son obligatorios.' });
        }

        const telefonoRegex = /^3[0-9]{9}$/;
        if (!telefonoRegex.test(telefono)) {
            return res.status(400).json({ 
        message: 'Error de formato: El telefono debe ser un numero movil colombiano valido de exactamente de 10 digitos.' 
    });
}

        if (estado !== 'activo' && estado !== 'inactivo' && estado !== 'graduado') {
            return res.status(400).json({ message: "Error: El estado debe ser estrictamente 'activo', 'inactivo' o 'graduado'." });
        }

        const clanCheck = await pool.query(`
            SELECT c.id, r.tipo, r.nombre AS ruta_nombre, r.tl_id 
            FROM clanes c 
            INNER JOIN rutas r ON c.ruta_id = r.id 
            WHERE c.id = $1;
        `, [clan_id]);

        if (clanCheck.rows.length === 0) {
            return res.status(404).json({ message: `Error: El Clan con ID ${clan_id} no existe en el sistema.` });
        }

        const infoClan = clanCheck.rows[0]; 

        // máximo de 15 cupos para cualquier ruta avanzada
        if (infoClan.tipo === 'avanzada') {
            const tlId = infoClan.tl_id;

            const countQuery = `
                SELECT COUNT(*)::INT as total_coders
                FROM coders co
                INNER JOIN clanes cl ON co.clan_id = cl.id
                INNER JOIN rutas ru ON cl.ruta_id = ru.id
                WHERE ru.tl_id = $1;
            `;
            const countResult = await pool.query(countQuery, [tlId]);
            const totalActual = countResult.rows[0].total_coders;

            // máximo de 15 por sala en avanzadas
            const limiteCupo = 15; 

            // Bloquear la matrícula si ya se alcanzó el cupo máximo
            if (totalActual >= limiteCupo) {
                return res.status(400).json({ 
                    message: `Error de Matrícula: La sala de esta ruta avanzada ya alcanzó su cupo máximo permitido de ${limiteCupo} coders.` 
                });
            }
        }

        const query = 'INSERT INTO coders (nombre, email, telefono, estado, clan_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
        const values = [nombre, email, telefono, estado, clan_id];

        const result = await pool.query(query, values);
        return res.status(201).json({ message: 'Coder registrado y asignado a su sala con éxito.', coder: result.rows[0] });

    } catch (error) {
        console.error("ERROR EN POSTGRESQL (POST CODER):", error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Error: El correo electrónico ya se encuentra registrado por otro estudiante.' });
        }
        return res.status(500).json({ message: 'Error al registrar al coder', error: error instanceof Error ? error.message : error });
    }
};
