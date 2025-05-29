const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  let token;

  // Verificar se o token existe no header de autorização
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extrair o token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Encontrar o usuário pelo ID e não incluir a senha
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        error: 'Não autorizado, token inválido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado, nenhum token fornecido'
    });
  }
};

// Middleware para verificar se o usuário é admin (para uso futuro)
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Não autorizado como administrador'
    });
  }
};
