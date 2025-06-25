import express from 'express';
import {
  getUserProfile,
  getUsers,
} from '../controllers/userController.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', validateObjectId('id'), getUserProfile);

export default router;