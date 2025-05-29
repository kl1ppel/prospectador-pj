const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

// Definição do modelo de Configuração do RD Station
const RdStationConfig = sequelize.define('RdStationConfig', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  apiToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Armazena configurações adicionais em formato JSON
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

// Relacionamento: cada configuração pertence a um usuário
RdStationConfig.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = RdStationConfig;
