import express from 'express';
import { getSalas, createSala } from '../controllers/sala.controller.js';

const router = express.Router();

router.get('/', getSalas);
router.post('/', createSala);

export default router;
