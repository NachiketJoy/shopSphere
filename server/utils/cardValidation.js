exports.validateCreditCard = (cardNumber) => {
  return /^\d{16}$/.test(cardNumber);
};

exports.validateExpiryDate = (expiryDate) => {
  return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate);
};

exports.validateCVV = (cvv) => {
  return /^\d{3}$/.test(cvv);
};
