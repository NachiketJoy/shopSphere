const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("../../models/authModels");
const authController = require("../../controller/authController");

// Mock dependencies
jest.mock("../../models/authModels");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../middleware/emailService");

describe("Authentication Controller Tests", () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    test("should create admin account if it doesn't exist", async () => {
      const mockReq = {
        flash: jest.fn(),
      };
      const mockRes = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Auth.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      await authController.authentication(mockReq, mockRes);

      expect(Auth.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith(
        "authentication",
        expect.any(Object)
      );
    });
  });

  describe("Register", () => {
    test("should register new user successfully", async () => {
      const mockReq = {
        body: {
          email: "test@test.com",
          password: "password123",
          fullName: "Test User",
        },
        flash: jest.fn(),
      };
      const mockRes = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Auth.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      await authController.register(mockReq, mockRes);

      expect(Auth.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockReq.flash).toHaveBeenCalledWith("success", expect.any(String));
      expect(mockRes.redirect).toHaveBeenCalledWith("/");
    });

    test("should return error if user already exists", async () => {
      const mockReq = {
        body: {
          email: "test@test.com",
          password: "password123",
          fullName: "Test User",
        },
        flash: jest.fn(),
      };
      const mockRes = {
        redirect: jest.fn(),
      };

      Auth.findOne.mockResolvedValue({ email: "test@test.com" });

      await authController.register(mockReq, mockRes);

      expect(mockReq.flash).toHaveBeenCalledWith(
        "error",
        "User already exists"
      );
      expect(mockRes.redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("Login", () => {
    test("should login user successfully", async () => {
      const mockReq = {
        body: {
          email: "test@test.com",
          password: "password123",
        },
        flash: jest.fn(),
      };
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
      };

      const mockUser = {
        _id: "userId123",
        email: "test@test.com",
        password: "hashedPassword",
        isBlocked: false,
      };

      Auth.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      await authController.login(mockReq, mockRes);

      expect(Auth.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "auth_token",
        "mockToken",
        expect.any(Object)
      );
    });
  });

  describe("Password Reset", () => {
    test("should send reset link successfully", async () => {
      const mockReq = {
        body: {
          email: "test@test.com",
        },
        flash: jest.fn(),
      };
      const mockRes = {
        redirect: jest.fn(),
      };

      const mockUser = {
        email: "test@test.com",
        save: jest.fn(),
      };

      Auth.findOne.mockResolvedValue(mockUser);

      await authController.sendResetLink(mockReq, mockRes);

      expect(Auth.findOne).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockReq.flash).toHaveBeenCalledWith("success", expect.any(String));
    });
  });

  describe("Update Password", () => {
    test("should update password successfully", async () => {
      const mockReq = {
        body: {
          currentPassword: "oldPassword",
          newPassword: "newPassword",
        },
        user: {
          _id: "userId123",
        },
      };
      const mockRes = {
        json: jest.fn(),
      };

      const mockUser = {
        password: "hashedOldPassword",
        save: jest.fn(),
      };

      Auth.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashedNewPassword");

      await authController.updatePassword(mockReq, mockRes);

      expect(Auth.findById).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Password updated successfully",
      });
    });
  });
});
