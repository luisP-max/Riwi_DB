import express from 'express';
import { getCoders, createCoder } from '../controllers/coder.controller.js';

const router = express.Router();

router.get('/', getCoders);
router.post('/', createCoder);

export default router;
