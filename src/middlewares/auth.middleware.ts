import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'llave_secreta_super_segura_de_riwi';

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extraer la cabecera de autorizacion
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Acceso denegado: Se requiere un token de autorizacion Bearer valido.' 
            });
        }

        // 2. Separar la palabra 'Bearer' del texto del token real
        const token = authHeader.split(' ')[1];

        // 3. Verificar de forma matematica si la firma digital es correcta
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Adjuntar los datos del usuario al objeto req para que los controladores sepan quien opera
        req.body.usuario_autenticado = decoded;

        // 5. Dar luz verde para pasar al siguiente controlador de la ruta
        return next();
    } catch (error) {
        console.error('[Auth Middleware Error] Token invalido:', error);
        return res.status(401).json({ 
            message: 'Acceso denegado: El token proporcionado es invalido o ya ha expirado.' 
            error: error instanceof Error ? error.message : error
        });
    }
};
