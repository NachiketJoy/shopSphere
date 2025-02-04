const CartItem = require("../../models/cartItemsModels");
const Product = require("../../models/productModels");
const cartController = require("../../controller/cartController");

// Mock the models
jest.mock("../../models/cartItemsModels");
jest.mock("../../models/productModels");

describe("Cart Controller Tests", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    test("should add new item to cart successfully", async () => {
      const mockReq = {
        body: { productId: "123" },
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Product.findById.mockResolvedValue({
        _id: "123",
        quantity: 10,
      });
      CartItem.findOne.mockResolvedValue(null);
      CartItem.create.mockResolvedValue({
        authId: "userId123",
        productId: "123",
        quantity: 1,
      });

      await cartController.addToCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Item added to cart successfully",
        cartItem: expect.any(Object),
      });
    });

    test("should increment quantity if item already exists in cart", async () => {
      const mockReq = {
        body: { productId: "123" },
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const existingCartItem = {
        authId: "userId123",
        productId: "123",
        quantity: 1,
        save: jest.fn(),
      };

      Product.findById.mockResolvedValue({
        _id: "123",
        quantity: 10,
      });
      CartItem.findOne.mockResolvedValue(existingCartItem);

      await cartController.addToCart(mockReq, mockRes);

      expect(existingCartItem.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getCartItems", () => {
    test("should return all cart items for user", async () => {
      const mockReq = {
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockCartItems = [
        { productId: "123", quantity: 2 },
        { productId: "456", quantity: 1 },
      ];

      CartItem.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCartItems),
      });

      await cartController.getCartItems(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        cartItems: mockCartItems,
      });
    });
  });

  describe("updateCartItem", () => {
    test("should update cart item quantity successfully", async () => {
      const mockReq = {
        params: { id: "cartItem123" },
        body: { quantity: 3 },
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockCartItem = {
        _id: "cartItem123",
        quantity: 1,
        save: jest.fn(),
      };

      CartItem.findOne.mockResolvedValue(mockCartItem);

      await cartController.updateCartItem(mockReq, mockRes);

      expect(mockCartItem.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("should return error for invalid quantity", async () => {
      const mockReq = {
        params: { id: "cartItem123" },
        body: { quantity: 0 },
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await cartController.updateCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Quantity must be at least 1",
      });
    });
  });

  describe("deleteCartItem", () => {
    test("should delete cart item successfully", async () => {
      const mockReq = {
        params: { id: "cartItem123" },
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      CartItem.findOneAndDelete.mockResolvedValue({
        _id: "cartItem123",
      });

      await cartController.deleteCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Item removed from cart successfully",
      });
    });
  });

  describe("clearCart", () => {
    test("should clear all items from cart", async () => {
      const mockReq = {
        user: { _id: "userId123" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      CartItem.deleteMany.mockResolvedValue({});

      await cartController.clearCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Cart cleared successfully",
      });
    });
  });
});
