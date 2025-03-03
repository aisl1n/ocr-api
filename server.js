// Importação das dependências necessárias
const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');

// Inicialização do Express e definição da porta
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Configuração do Multer para processamento de uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
      return cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
    cb(null, true);
  }
});

// Middleware para parsing de JSON no body das requisições
app.use(express.json());

// Rota raiz - Página informativa
app.get('/', (req, res) => {
  res.send('API de OCR com Tesseract.js. Faça upload de uma imagem para /api/ocr');
});

// Rota principal de OCR - Aceita uploads de imagens e retorna o texto extraído
app.post('/api/ocr', upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ erro: 'Nenhuma imagem foi enviada' });
    }

    const resultado = await Tesseract.recognize(
      req.files[0].buffer,
      'por'
    );

    res.json({
      texto: resultado.data.text || ''
    });
  } catch (erro) {
    console.error('Erro ao processar OCR:', erro);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro ao processar a imagem', 
      detalhes: erro.message 
    });
  }
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor OCR rodando na porta ${port}`);
});