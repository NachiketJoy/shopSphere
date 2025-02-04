const mainController = require("../../controller/mainController");
const Auth = require("../../models/authModels");
const Order = require("../../models/orderModels");

jest.mock("../../models/authModels");
jest.mock("../../models/orderModels");
jest.mock("../../middleware/emailService");

describe("Main Controller", () => {
  // Test order function
  describe("order", () => {
    test("should render order page with user orders", async () => {
      const mockOrders = [
        { _id: "1", orderItems: [] },
        { _id: "2", orderItems: [] },
      ];
      const mockReq = {
        user: { _id: "123" },
      };
      const mockRes = {
        render: jest.fn(),
      };

      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockOrders),
        }),
      });

      await mainController.order(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith("order", {
        title: "Order History",
        user: mockReq.user,
        orders: mockOrders,
      });
    });
  });

  // Test allUsers function
  describe("allUsers", () => {
    test("should render dashboard for admin user", async () => {
      process.env.ADMIN_LOGIN_EMAIL = "admin@test.com";
      const mockUsers = [
        { email: "admin@test.com" },
        { email: "user@test.com" },
      ];
      const mockReq = {
        user: { email: "admin@test.com" },
        flash: jest.fn().mockReturnValue(""),
      };
      const mockRes = {
        render: jest.fn(),
      };

      Auth.find.mockResolvedValue(mockUsers);

      await mainController.allUsers(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith("dashboard", {
        title: "Dashboard",
        users: mockUsers,
        message: "",
      });
    });

    test("should render 404 for non-admin user", async () => {
      process.env.ADMIN_LOGIN_EMAIL = "admin@test.com";
      const mockUsers = [
        { email: "admin@test.com" },
        { email: "user@test.com" },
      ];
      const mockReq = {
        user: { email: "user@test.com" },
        flash: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      };

      Auth.find.mockResolvedValue(mockUsers);

      await mainController.allUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.render).toHaveBeenCalledWith("404", {
        title: "Not Found",
      });
    });
  });
});
