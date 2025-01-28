// Validate credit card number
exports.validateCreditCard = (cardNumber) => {
  // Checks if the card number has exactly 16 digits (0-9)
  // Returns true if valid, false if invalid
  return /^\d{16}$/.test(cardNumber);
};

// Validate expiry date
exports.validateExpiryDate = (expiryDate) => {
  // Checks if the expiry date follows MM/YY format where:
  // (0[1-9]|1[0-2]) - month from 01-12
  // \/ - forward slash
  // ([0-9]{2}) - two digits for year
  // Returns true if valid, false if invalid
  return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate);
};

// Validate CVV (Card Verification Value)
exports.validateCVV = (cvv) => {
  // Checks if the CVV has exactly 3 digits (0-9)
  // Returns true if valid, false if invalid
  return /^\d{3}$/.test(cvv);
};
