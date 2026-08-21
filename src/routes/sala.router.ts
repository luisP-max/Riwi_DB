import express from 'express';
import { getSalas, createSala, updateSala, deleteSala } from '../controllers/sala.controller.js';

const router = express.Router();

router.get('/', getSalas);
router.post('/', createSala);
router.put('/:id', updateSala);     
router.delete('/:id', deleteSala);  

export default router;
