import { type Request, type Response } from 'express';
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'llave_secreta_segura_de_riwi';

// 1. REGISTRO DE NUEVOS USUARIOS ADMINISTRATIVOS
export const register = async (req: Request, res: Response) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Error: Todos los campos son obligatorios.' });
        }

        // Encriptar la contraseña 10 veces por seguridad
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, created_at;';
        const result = await pool.query(query, [nombre, email, passwordHash]);

        return res.status(201).json({ message: 'Usuario administrativo registrado con exito', user: result.rows[0] });
    } catch (error) {
        console.error('[Auth Error] Error en el registro:', error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Error: El correo electronico ya esta registrado.' });
        }
        return res.status(500).json({ message: 'Error interno en el servidor', error });
    }
};

// 2. INICIO DE SESIÓN Y GENERACIÓN DE TOKEN JWT
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Error: Correo y contraseña requeridos.' });
        }

        // Buscar al usuario en PostgreSQL de forma parametrizada
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE email = $1;', [email]);
        if (userCheck.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales invalidas (Correo incorrecto).' });
        }

        const usuario = userCheck.rows[0];

        // Comparar la contraseña ingresada contra el hash encriptado de Docker
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ message: 'Credenciales invalidas (Contraseña incorrecta).' });
        }

        // Fabricar el Token digital de acceso con una duracion de 2 horas
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            message: 'Autenticacion exitosa. Bienvenido al sistema de Riwi',
            token,
            user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
        });
    } catch (error) {
        console.error('[Auth Error] Error en el login:', error);
        return res.status(500).json({ message: 'Error interno en el login', error });
    }
};
