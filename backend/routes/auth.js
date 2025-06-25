import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateProfile,
} from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfile, updateProfile);
router.get('/logout', protect, logout);


export default router;