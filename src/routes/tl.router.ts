import express from 'express';
import { getTLs, createTL } from '../controllers/tl.controller.js';

const router = express.Router();

router.get('/', getTLs);
router.post('/', createTL);

export default router;