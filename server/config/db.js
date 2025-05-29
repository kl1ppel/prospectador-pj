const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configurações do banco de dados a partir do arquivo .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true, // Adiciona automaticamente createdAt e updatedAt
      underscored: true, // Usa snake_case em vez de camelCase
    },
  }
);

// Função para testar a conexão com o banco de dados
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
