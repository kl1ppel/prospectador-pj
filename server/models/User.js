const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

// Definição do modelo de Usuário
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  // Hooks do Sequelize (ganchos que são executados antes/depois de operações)
  hooks: {
    // Antes de criar um usuário, criptografa a senha
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Antes de atualizar um usuário, criptografa a senha (se foi alterada)
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para verificar senha
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para gerar token de redefinição de senha
User.prototype.generateResetPasswordToken = function() {
  // Gerar um token aleatório
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  
  // Criptografar o token e armazenar no banco
  this.resetPasswordToken = resetToken;
  
  // Definir a expiração do token (24 horas)
  this.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return resetToken;
};

module.exports = User;
