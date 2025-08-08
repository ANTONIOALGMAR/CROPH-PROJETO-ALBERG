const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo: timestamp + extensão original
  },
});

const upload = multer({ storage: storage });

module.exports = upload;