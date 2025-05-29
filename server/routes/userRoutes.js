const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Todas as rotas de usuários são protegidas
router.use(protect);

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Privado
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter perfil do usuário'
    });
  }
});

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Privado
router.put('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Atualizar campos permitidos
    const { name, email, password } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar perfil do usuário'
    });
  }
});

module.exports = router;
