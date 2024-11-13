// controllers/order.controller.js
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
  
    try {
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      order.orderStatus = 'delivered';
      await order.save();
  
      res.status(200).json({ message: 'Order status updated to delivered', order });
    } catch (error) {
      res.status(500).json({ message: 'Error updating order status', error });
    }
  };
  