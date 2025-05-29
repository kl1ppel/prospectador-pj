const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rotas protegidas
router.get('/me', protect, getMe);

module.exports = router;
