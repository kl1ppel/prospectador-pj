const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize, testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const rdStationRoutes = require('./routes/rdStationRoutes');
const userRoutes = require('./routes/userRoutes');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rdstation', rdStationRoutes);
app.use('/api/users', userRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Prospect HUB está funcionando!' });
});

// Testar conexão e sincronizar o banco de dados antes de iniciar o servidor
testConnection();
sequelize.sync()
  .then(() => {
    console.log('Banco de dados sincronizado com sucesso.');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse http://localhost:${PORT} para testar a API`);
    });
  })
  .catch(err => {
    console.error('Erro ao sincronizar o banco de dados:', err);
  });

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

module.exports = app;
