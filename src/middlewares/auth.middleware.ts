import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'llave_secreta_super_segura_de_riwi';

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Acceso denegado: Se requiere un token de autorizacion Bearer valido.' 
            });
        }

        const parts = authHeader.split(' ');
        const tokenReal = parts[1];

        if (!tokenReal) {
            return res.status(401).json({ message: 'Acceso denegado: Estructura de token invalida.' });
        }

        const decoded = jwt.verify(tokenReal, JWT_SECRET);

        req.body.usuario_autenticado = decoded;
        return next();
    } catch (error) {
        console.error('[Auth Middleware Error] Token invalido:', error);
        
        return res.status(401).json({ 
            message: 'Acceso denegado: El token proporcionado es invalido o ya ha expirado.',
            error: error instanceof Error ? error.message : error
        });
    }
};
