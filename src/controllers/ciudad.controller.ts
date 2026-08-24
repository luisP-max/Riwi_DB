import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';

//obtenemos y mostramos las ciudades
export const getCiudades = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM ciudades ORDER BY id ASC;');
        return res.json(result.rows);
    } catch (error) {
        return res.status(500).json({ message: 'Error al consultar las ciudades', error });
    }
};
//aqui es para crear las ciudades (por las cedes existentes seria entre MEDELLIN y BARRANQUILLA, en un futuro pensamos en crear mas sedes para encontrar mejores desarrolladores de software).
export const createCiudad = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: 'El campo nombre es obligatorio.' });

        const query = 'INSERT INTO ciudades (nombre) VALUES ($1) RETURNING *;';
        const result = await pool.query(query, [nombre]);
        return res.status(201).json({ message: 'Ciudad registrada con éxito', ciudad: result.rows[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Error al registrar la ciudad', error });
    }
};
