const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// CRUD completo para produtos
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, description } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantidade não pode ser negativa' });
    }
    
    const product = new Product({ name, price, quantity, description });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar produto', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity && quantity < 0) {
      return res.status(400).json({ message: 'Quantidade não pode ser negativa' });
    }
    
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar produto', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao deletar produto', error: err.message });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};