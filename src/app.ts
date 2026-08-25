import express from 'express';
import 'dotenv/config';
import { ConnectDB } from './config/db.js';
import { checkAuth } from './middlewares/auth.middleware.js';


import routerTL from './routes/tl.router.js';
import routerRuta from './routes/ruta.router.js';
import routerClan from './routes/clan.router.js';
import routerCoder from './routes/coder.router.js';
import routerSala from './routes/sala.router.js';
import routerCiudad from './routes/ciudad.router.js';
import routerAuth from './routes/auth.router.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor respondiendo de forma nativa!" });
});

app.use('/api/auth', routerAuth);

app.use('/api/ciudades', checkAuth, routerCiudad);
app.use('/api/tls', checkAuth, routerTL);
app.use('/api/rutas', checkAuth, routerRuta);
app.use('/api/clanes', checkAuth, routerClan);
app.use('/api/coders', checkAuth, routerCoder);
app.use('/api/ciudades', routerCiudad);
app.use('/api/salas', checkAuth, routerSala);


app.listen(Number(PORT), async () => {
    try {
        await ConnectDB();
        console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
    } catch (error) {
        console.error("Fallo crítico al iniciar el sistema:", error);
    }
});
