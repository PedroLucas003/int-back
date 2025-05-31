// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.userId;

    // Verificar se há itens no pedido
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'O pedido deve conter pelo menos um item' });
    }

    let total = 0;
    const productsToUpdate = [];

    // 1. Verificar todos os produtos e calcular o total
    for (const item of items) {
      // Validar item
      if (!item.product || !item.quantity) {
        return res.status(400).json({ message: 'Cada item deve ter um produto e uma quantidade' });
      }

      // Buscar produto no banco de dados
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Produto com ID ${item.product} não encontrado` });
      }

      // Verificar estoque
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente para ${product.name}. Disponível: ${product.quantity}, Solicitado: ${item.quantity}`
        });
      }

      // Calcular subtotal
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      // Guardar informações para atualização do estoque
      productsToUpdate.push({
        productId: product._id,
        quantity: item.quantity
      });
    }

    // 2. Criar o pedido
    const orderItems = items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      priceAtPurchase: item.price // Você pode querer usar o preço atual do produto aqui
    }));

    const order = new Order({
      user: userId,
      items: orderItems,
      total,
      status: 'completed'
    });

    // 3. Atualizar estoque (em uma transação para garantir atomicidade)
    const session = await Order.startSession();
    session.startTransaction();

    try {
      // Atualizar estoque de cada produto
      for (const update of productsToUpdate) {
        await Product.findByIdAndUpdate(
          update.productId,
          { $inc: { quantity: -update.quantity } },
          { session }
        );
      }

      // Salvar o pedido
      await order.save({ session });

      // Confirmar a transação
      await session.commitTransaction();
      session.endSession();

      res.status(201).json(order);
    } catch (error) {
      // Se algo der errado, desfazer todas as operações
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    res.status(500).json({ message: 'Erro ao processar pedido', error: error.message });
  }
};

module.exports = {
  createOrder
};