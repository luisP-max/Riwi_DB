import express from 'express';
import { getCiudades, createCiudad } from '../controllers/ciudad.controller.js';

const router = express.Router();

router.get('/', getCiudades);
router.post('/', createCiudad);

export default router;
