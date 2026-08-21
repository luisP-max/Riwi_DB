import express from 'express';
import { getRutas, createRuta } from '../controllers/ruta.controller.js';

const router = express.Router();

router.get('/', getRutas);
router.post('/', createRuta);

export default router;
