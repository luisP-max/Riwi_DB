import express from 'express';
import { getClanes, createClan } from '../controllers/clan.controller.js';

const router = express.Router();

router.get('/', getClanes);
router.post('/', createClan);

export default router;
