const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

// Definição do modelo de Histórico de Mensagens
const MessageHistory = sequelize.define('MessageHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('whatsapp', 'rdstation'),
    allowNull: false,
    defaultValue: 'whatsapp',
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent',
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  // Campos adicionais para mensagens do tipo RD Station
  contactName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Armazena informações extras em formato JSON
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Relacionamento: cada mensagem pertence a um usuário
MessageHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = MessageHistory;
