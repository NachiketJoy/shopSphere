const orderController = require("../../controller/orderController");
const Order = require("../../models/orderModels");
const CartItem = require("../../models/cartItemsModels");
const Product = require("../../models/productModels");
const Auth = require("../../models/authModels");
const cardValidation = require("../../utils/cardValidation");

// Mock the models and dependencies
jest.mock("../../models/orderModels");
jest.mock("../../models/cartItemsModels");
jest.mock("../../models/productModels");
jest.mock("../../models/authModels");
jest.mock("../../utils/cardValidation");

describe("Order Controller", () => {
  let mockReq;
  let mockRes;
  let mockIO;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockReq = {
      user: { _id: "user123" },
      body: {
        cardNumber: "4242424242424242",
        expiryDate: "12/25",
        cvv: "123",
        shippingAddress: "123 Test St",
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock IO
    mockIO = {
      emit: jest.fn(),
      of: jest.fn().mockReturnThis(),
    };
    orderController.setIO(mockIO);
  });

  describe("createOrder", () => {
    test("should create order successfully", async () => {
      // Mock validations
      cardValidation.validateCreditCard.mockReturnValue(true);
      cardValidation.validateExpiryDate.mockReturnValue(true);
      cardValidation.validateCVV.mockReturnValue(true);

      // Mock cart items
      const mockCartItems = [
        {
          productId: {
            _id: "prod123",
            price: 100,
            name: "Test Product",
            quantity: 10,
          },
          quantity: 2,
          authId: "user123",
        },
      ];
      CartItem.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCartItems),
      });

      // Mock product
      Product.findById.mockResolvedValue({
        _id: "prod123",
        quantity: 10,
      });

      // Mock order creation
      const mockOrder = {
        _id: "order123",
        userId: "user123",
        status: "pending",
      };
      Order.create.mockResolvedValue(mockOrder);

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Order created successfully",
        order: mockOrder,
      });
    });

    test("should return error for invalid card number", async () => {
      cardValidation.validateCreditCard.mockReturnValue(false);

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid card number",
      });
    });
  });

  describe("getOrderStatus", () => {
    test("should return order status successfully", async () => {
      const mockOrder = {
        status: "pending",
        orderedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
      };

      Order.findOne.mockResolvedValue(mockOrder);

      mockReq.params = { orderId: "order123" };

      await orderController.getOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        status: mockOrder.status,
        orderedAt: mockOrder.orderedAt,
        shippedAt: mockOrder.shippedAt,
        deliveredAt: mockOrder.deliveredAt,
      });
    });

    test("should return 404 for non-existent order", async () => {
      Order.findOne.mockResolvedValue(null);

      mockReq.params = { orderId: "nonexistent" };

      await orderController.getOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Order not found",
      });
    });
  });

  describe("getAllOrders", () => {
    test("should return all orders for user", async () => {
      const mockOrders = [
        { _id: "order1", userId: "user123" },
        { _id: "order2", userId: "user123" },
      ];

      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockOrders),
      });

      await orderController.getAllOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        orders: mockOrders,
      });
    });
  });

  describe("allOrders", () => {
    test("should return 404 for non-admin user", async () => {
      process.env.ADMIN_LOGIN_EMAIL = "admin@test.com";

      const mockUsers = [{ email: "admin@test.com" }];
      Auth.find.mockResolvedValue(mockUsers);

      mockReq.user = { email: "user@test.com" };

      mockRes.render = jest.fn();

      await orderController.allOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.render).toHaveBeenCalledWith("404", {
        title: "Not Found",
      });
    });
  });
});
