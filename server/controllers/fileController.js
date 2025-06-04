const path = require('path');
const fs = require('fs');

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, originalName: req.file.originalname });
};

exports.downloadFile = (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Arquivo não encontrado' });
  }

  res.download(filePath);
};
