const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/db');
const User = require('./models/User');
const MessageHistory = require('./models/MessageHistory');
const RdStationConfig = require('./models/RdStationConfig');
require('dotenv').config();

// Inicialização do app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Testar conexão com o banco de dados
testConnection();

// Inicializar modelos e criar tabelas no banco de dados
const initDatabase = async () => {
  try {
    // Sincroniza os modelos com o banco de dados
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
};

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API do Prospect HUB funcionando!' });
});

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const rdStationRoutes = require('./routes/rdStationRoutes');

// Uso das rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rdstation', rdStationRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Erro interno do servidor'
  });
});

// Porta e inicialização do servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // Inicializar banco de dados
  await initDatabase();
});

// Tratamento para encerramento gracioso
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('Conexão com banco de dados encerrada.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao encerrar conexão com banco de dados:', error);
    process.exit(1);
  }
});
