// Validation functions
const isValidCardNumber = validCardNumber => /^\d{16}$/.test(validCardNumber);

const isValidExpiryDate = validDate => /^\d{2}\/\d{2}$/.test(validDate);

const isValidCVV = validCvv => /^\d{3}$/.test(validCvv);

const isValidPostalCode = validPostalCode => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(validPostalCode);