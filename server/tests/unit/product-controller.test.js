const productController = require("../../controller/productController");
const Product = require("../../models/productModels");
const Auth = require("../../models/authModels");

// Mock the models
jest.mock("../../models/productModels");
jest.mock("../../models/authModels");

describe("Product Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProducts", () => {
    test("should return products with pagination for non-admin users", async () => {
      const mockReq = {
        query: {
          page: 1,
          limit: 12,
        },
        user: {
          email: "user@test.com",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProducts = [{ name: "Product 1" }, { name: "Product 2" }];

      Auth.find.mockResolvedValue([
        { email: "admin@test.com" },
        { email: "user@test.com" },
      ]);
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts),
      });
      Product.countDocuments.mockResolvedValue(2);

      process.env.ADMIN_LOGIN_EMAIL = "admin@test.com";

      await productController.getProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 12,
        },
      });
    });

    test("should return all products without pagination for admin users", async () => {
      const mockReq = {
        query: {},
        user: {
          email: "admin@test.com",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProducts = [{ name: "Product 1" }, { name: "Product 2" }];

      Auth.find.mockResolvedValue([{ email: "admin@test.com" }]);
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts),
      });

      process.env.ADMIN_LOGIN_EMAIL = "admin@test.com";

      await productController.getProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        pagination: null,
      });
    });
  });

  describe("getProductById", () => {
    test("should return product by ID", async () => {
      const mockReq = {
        params: {
          id: "123",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProduct = { _id: "123", name: "Test Product" };
      Product.findById.mockResolvedValue(mockProduct);

      await productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    test("should return 404 if product not found", async () => {
      const mockReq = {
        params: {
          id: "123",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Product.findById.mockResolvedValue(null);

      await productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Product not found",
      });
    });
  });

  describe("createProduct", () => {
    test("should create new product", async () => {
      const mockReq = {
        body: {
          name: "New Product",
          price: 99.99,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProduct = {
        _id: "123",
        name: "New Product",
        price: 99.99,
        save: jest.fn(),
      };

      Product.mockImplementation(() => mockProduct);

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });
  });

  describe("updateProduct", () => {
    test("should update existing product", async () => {
      const mockReq = {
        params: {
          id: "123",
        },
        body: {
          name: "Updated Product",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProduct = { _id: "123", name: "Updated Product" };
      Product.findByIdAndUpdate.mockResolvedValue(mockProduct);

      await productController.updateProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });
  });

  describe("deleteProduct", () => {
    test("should delete product", async () => {
      const mockReq = {
        params: {
          id: "123",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProduct = { _id: "123", name: "Product to Delete" };
      Product.findByIdAndDelete.mockResolvedValue(mockProduct);

      await productController.deleteProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Product deleted successfully",
      });
    });
  });
});
