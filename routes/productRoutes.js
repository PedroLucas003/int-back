const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, adminOnly } = require('../middleware/auth');

// Rotas públicas
router.get('/', productController.getAllProducts);

// Rotas protegidas (apenas admin)
router.post('/', auth, adminOnly, productController.createProduct);
router.put('/:id', auth, adminOnly, productController.updateProduct);
router.delete('/:id', auth, adminOnly, productController.deleteProduct);

module.exports = router;