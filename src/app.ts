import express from 'express';
import 'dotenv/config';
import { ConnectDB } from './config/db.js';

import routerTL from './routes/tl.router.js';
import routerRuta from './routes/ruta.router.js';
import routerClan from './routes/clan.router.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor respondiendo de forma nativa!" });
});

app.use('/api/tls', routerTL);
app.use('/api/rutas', routerRuta);
app.use('/api/clanes', routerClan);

app.listen(Number(PORT), async () => {
    try {
        await ConnectDB();
        console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
    } catch (error) {
        console.error("Fallo crítico al iniciar el sistema:", error);
    }
});
