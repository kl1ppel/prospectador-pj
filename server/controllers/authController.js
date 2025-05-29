const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Público
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se todos os campos foram preenchidos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, preencha todos os campos'
      });
    }

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já existe'
      });
    }

    // Criar o usuário
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          token: generateToken(user.id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Dados de usuário inválidos'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário'
    });
  }
};

// @desc    Autenticar usuário e gerar token
// @route   POST /api/auth/login
// @access  Público
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça email e senha'
      });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    // Verificar se a senha está correta
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    });
  }
};

// @desc    Obter dados do usuário atual
// @route   GET /api/auth/me
// @access  Privado
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter dados do usuário'
    });
  }
};

// @desc    Solicitar redefinição de senha
// @route   POST /api/auth/forgot-password
// @access  Público
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça um email'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Gerar token de redefinição
    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // Em uma aplicação real, enviaria um email com o link para redefinição
    // Aqui apenas retornamos o token para testes
    res.json({
      success: true,
      message: 'Email de redefinição enviado',
      resetToken // Remover isso em produção!
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar solicitação de redefinição de senha'
    });
  }
};

// @desc    Redefinir senha
// @route   POST /api/auth/reset-password
// @access  Público
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça o token e a nova senha'
      });
    }

    // Procurar usuário com o token fornecido e que ainda não expirou
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Definir nova senha
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao redefinir senha'
    });
  }
};
