// backend/controllers/userController.js
const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const isAdmin = email === 'p@gmail.com';
    const user = new User({ name, email, password, isAdmin });
    await user.save();
    res.status(201).json({ 
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar usuário', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar usuário', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao deletar usuário', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};