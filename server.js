// backend/server.js
require('dotenv').config();
const express = require('express');
const cors =require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
// Configuração do CORS mais segura para produção
const allowedOrigins = [process.env.FRONTEND_URL]; // Sua URL do frontend Vercel
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000'); // Permite localhost em desenvolvimento
}

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como Postman, apps mobile) em desenvolvimento ou se não houver origin
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && origin) { // Adicionado "&& origin" para evitar erro com undefined
      const msg = 'A política CORS para este site não permite acesso da Origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Importar rotas
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Usar rotas
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do E-commerce está funcionando!');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});