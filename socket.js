const orderController = require("./server/controller/orderController");

const initializeSocket = (io) => {
  orderController.setIO(io);
};

module.exports = initializeSocket;
