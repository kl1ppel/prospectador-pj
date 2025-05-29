const express = require('express');
const {
  sendMessage,
  getMessages,
  getMessage,
  deleteMessage,
  clearMessageHistory
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas de mensagens são protegidas
router.use(protect);

// Rota para obter todas as mensagens e enviar novas mensagens
router.route('/')
  .get(getMessages)
  .post(sendMessage)
  .delete(clearMessageHistory);

// Rotas para gerenciar mensagens específicas
router.route('/:id')
  .get(getMessage)
  .delete(deleteMessage);

module.exports = router;
