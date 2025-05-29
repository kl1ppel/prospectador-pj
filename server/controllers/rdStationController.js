const RdStationConfig = require('../models/RdStationConfig');

// @desc    Salvar ou atualizar configuração do RD Station
// @route   POST /api/rdstation/config
// @access  Privado
exports.saveConfig = async (req, res) => {
  try {
    const { apiToken, settings } = req.body;

    if (!apiToken) {
      return res.status(400).json({
        success: false,
        error: 'Token da API é obrigatório'
      });
    }

    // Verificar se já existe uma configuração para este usuário
    let config = await RdStationConfig.findOne({
      where: { userId: req.user.id }
    });

    if (config) {
      // Atualizar configuração existente
      config.apiToken = apiToken;
      if (settings) config.settings = settings;
      config.lastSyncAt = new Date();
      await config.save();
    } else {
      // Criar nova configuração
      config = await RdStationConfig.create({
        userId: req.user.id,
        apiToken,
        settings: settings || {},
        lastSyncAt: new Date()
      });
    }

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao salvar configuração do RD Station'
    });
  }
};

// @desc    Obter configuração do RD Station
// @route   GET /api/rdstation/config
// @access  Privado
exports.getConfig = async (req, res) => {
  try {
    const config = await RdStationConfig.findOne({
      where: { userId: req.user.id }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada'
      });
    }

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter configuração do RD Station'
    });
  }
};

// @desc    Enviar contato para o RD Station
// @route   POST /api/rdstation/contact
// @access  Privado
exports.sendContact = async (req, res) => {
  try {
    const { name, email, phone, companyName, website, jobTitle, customFields } = req.body;

    // Validação básica
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nome e email são obrigatórios'
      });
    }

    // Verificar se há configuração do RD Station
    const config = await RdStationConfig.findOne({
      where: { userId: req.user.id }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuração do RD Station não encontrada'
      });
    }

    // Em uma implementação real, aqui seria feita a integração com a API do RD Station
    // Para este exemplo, vamos apenas simular o envio

    // Criar entrada no histórico de mensagens
    const MessageHistory = require('../models/MessageHistory');
    const message = await MessageHistory.create({
      userId: req.user.id,
      phoneNumber: phone || '',
      message: `Contato enviado para o RD Station: ${name} (${email})`,
      type: 'rdstation',
      status: 'sent',
      sentAt: new Date(),
      contactName: name,
      contactEmail: email,
      metadata: {
        companyName,
        website,
        jobTitle,
        customFields
      }
    });

    res.json({
      success: true,
      message: 'Contato enviado com sucesso para o RD Station',
      contact: {
        name,
        email,
        phone,
        companyName,
        website,
        jobTitle
      },
      messageId: message.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar contato para o RD Station'
    });
  }
};

// @desc    Excluir configuração do RD Station
// @route   DELETE /api/rdstation/config
// @access  Privado
exports.deleteConfig = async (req, res) => {
  try {
    const config = await RdStationConfig.findOne({
      where: { userId: req.user.id }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada'
      });
    }

    await config.destroy();

    res.json({
      success: true,
      message: 'Configuração do RD Station excluída com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir configuração do RD Station'
    });
  }
};
