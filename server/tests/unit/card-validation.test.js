// Import the functions
const {
  validateCreditCard,
  validateExpiryDate,
  validateCVV,
} = require("../../utils/cardValidation");

describe("Credit Card Validation Functions", () => {
  // Tests for validateCreditCard
  describe("validateCreditCard", () => {
    test("should return true for valid 16-digit card number", () => {
      expect(validateCreditCard("1234567890123456")).toBe(true);
    });

    test("should return false for card number with less than 16 digits", () => {
      expect(validateCreditCard("123456789012345")).toBe(false);
    });

    test("should return false for card number with more than 16 digits", () => {
      expect(validateCreditCard("12345678901234567")).toBe(false);
    });

    test("should return false for card number with non-numeric characters", () => {
      expect(validateCreditCard("1234567890abcdef")).toBe(false);
    });

    test("should return false for empty string", () => {
      expect(validateCreditCard("")).toBe(false);
    });
  });

  // Tests for validateExpiryDate
  describe("validateExpiryDate", () => {
    test("should return true for valid expiry date format (MM/YY)", () => {
      expect(validateExpiryDate("12/25")).toBe(true);
    });

    test("should return true for valid single-digit month with leading zero", () => {
      expect(validateExpiryDate("05/23")).toBe(true);
    });

    test("should return false for invalid month (00)", () => {
      expect(validateExpiryDate("00/23")).toBe(false);
    });

    test("should return false for invalid month (13)", () => {
      expect(validateExpiryDate("13/23")).toBe(false);
    });

    test("should return false for missing leading zero in month", () => {
      expect(validateExpiryDate("5/23")).toBe(false);
    });

    test("should return false for wrong separator", () => {
      expect(validateExpiryDate("05-23")).toBe(false);
    });

    test("should return false for empty string", () => {
      expect(validateExpiryDate("")).toBe(false);
    });
  });

  // Tests for validateCVV
  describe("validateCVV", () => {
    test("should return true for valid 3-digit CVV", () => {
      expect(validateCVV("123")).toBe(true);
    });

    test("should return false for CVV with less than 3 digits", () => {
      expect(validateCVV("12")).toBe(false);
    });

    test("should return false for CVV with more than 3 digits", () => {
      expect(validateCVV("1234")).toBe(false);
    });

    test("should return false for CVV with non-numeric characters", () => {
      expect(validateCVV("12a")).toBe(false);
    });

    test("should return false for empty string", () => {
      expect(validateCVV("")).toBe(false);
    });
  });
});
