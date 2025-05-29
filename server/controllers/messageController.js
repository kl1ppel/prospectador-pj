const MessageHistory = require('../models/MessageHistory');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Enviar uma nova mensagem
// @route   POST /api/messages
// @access  Privado
exports.sendMessage = async (req, res) => {
  try {
    const { phoneNumber, message, type, contactName, contactEmail, metadata } = req.body;

    // Validação básica
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Número de telefone e mensagem são obrigatórios'
      });
    }

    // Criar uma nova entrada no histórico de mensagens
    const newMessage = await MessageHistory.create({
      userId: req.user.id,
      phoneNumber,
      message,
      type: type || 'whatsapp',
      status: 'sent',
      sentAt: new Date(),
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      metadata: metadata || null
    });

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem'
    });
  }
};

// @desc    Obter todas as mensagens do usuário
// @route   GET /api/messages
// @access  Privado
exports.getMessages = async (req, res) => {
  try {
    // Filtros opcionais
    const { type, startDate, endDate, query } = req.query;
    
    // Construir condições de busca
    const whereConditions = {
      userId: req.user.id
    };
    
    // Filtrar por tipo
    if (type) {
      whereConditions.type = type;
    }
    
    // Filtrar por intervalo de datas
    if (startDate || endDate) {
      whereConditions.sentAt = {};
      
      if (startDate) {
        whereConditions.sentAt[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        whereConditions.sentAt[Op.lte] = new Date(endDate);
      }
    }
    
    // Busca por texto na mensagem, nome do contato ou email do contato
    if (query) {
      whereConditions[Op.or] = [
        { message: { [Op.like]: `%${query}%` } },
        { contactName: { [Op.like]: `%${query}%` } },
        { contactEmail: { [Op.like]: `%${query}%` } },
        { phoneNumber: { [Op.like]: `%${query}%` } }
      ];
    }

    // Obter mensagens com paginação
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    const messages = await MessageHistory.findAndCountAll({
      where: whereConditions,
      limit: pageSize,
      offset,
      order: [['sentAt', 'DESC']], // Ordenar por data de envio (mais recentes primeiro)
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      count: messages.count,
      pages: Math.ceil(messages.count / pageSize),
      currentPage: page,
      messages: messages.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter mensagens'
    });
  }
};

// @desc    Obter uma mensagem específica
// @route   GET /api/messages/:id
// @access  Privado
exports.getMessage = async (req, res) => {
  try {
    const message = await MessageHistory.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter mensagem'
    });
  }
};

// @desc    Excluir uma mensagem
// @route   DELETE /api/messages/:id
// @access  Privado
exports.deleteMessage = async (req, res) => {
  try {
    const message = await MessageHistory.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }

    await message.destroy();

    res.json({
      success: true,
      message: 'Mensagem excluída com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir mensagem'
    });
  }
};

// @desc    Limpar histórico de mensagens
// @route   DELETE /api/messages
// @access  Privado
exports.clearMessageHistory = async (req, res) => {
  try {
    // Filtros opcionais
    const { type, startDate, endDate } = req.query;
    
    // Construir condições de busca
    const whereConditions = {
      userId: req.user.id
    };
    
    // Filtrar por tipo
    if (type) {
      whereConditions.type = type;
    }
    
    // Filtrar por intervalo de datas
    if (startDate || endDate) {
      whereConditions.sentAt = {};
      
      if (startDate) {
        whereConditions.sentAt[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        whereConditions.sentAt[Op.lte] = new Date(endDate);
      }
    }

    // Excluir mensagens que correspondem aos critérios
    const result = await MessageHistory.destroy({
      where: whereConditions
    });

    res.json({
      success: true,
      message: `${result} mensagens excluídas com sucesso`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar histórico de mensagens'
    });
  }
};
