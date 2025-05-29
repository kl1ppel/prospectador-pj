const express = require('express');
const {
  saveConfig,
  getConfig,
  sendContact,
  deleteConfig
} = require('../controllers/rdStationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas do RD Station são protegidas
router.use(protect);

// Rotas para configuração do RD Station
router.route('/config')
  .get(getConfig)
  .post(saveConfig)
  .delete(deleteConfig);

// Rota para enviar contato para o RD Station
router.post('/contact', sendContact);

module.exports = router;
