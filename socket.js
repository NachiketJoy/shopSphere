const orderController = require("./server/controller/orderController");

module.exports = (io) => {
  io.on('connection', (socket) => {
      // console.log('a user connected', socket.id);

      orderController.setIO(io);

      socket.on('newPromo', (promoData) => {
        // Send the discounted message to all users
        socket.broadcast.emit('newMessage', promoData);
      });

      socket.on('lastItem', (lastItemData) => {
        socket.broadcast.emit('newMessage', lastItemData);
      });

      // User disconnect
      socket.on('disconnect', () => {
          // console.log('a user disconnected', socket.id);
      });
  });
}