export const validateForm = (formData, products) => {
    let errors = {};

    // Client validation
    if (!formData.buyerName) {
      errors.buyerName = 'Wybierz klienta';
    }

    // Product fields validation
    products.forEach((product, index) => {
      if (!product.productName) {
        errors[`productName_${index}`] = 'Nazwa produktu jest wymagana';
      }
      if (!product.quantity || product.quantity <= 0) {
        errors[`quantity${index}`] = 'Ilość powinna być większa niż 0';
      }
      if (!product.netAmount || product.netAmount <= 0) {
        errors[`netAmount${index}`] = 'Cena netto powinna być większa niż 0';
      }
    });
    // Bank Name and Account Number validation if payment method is bank transfer
    if (formData.payment === 'bank_transfer') {
      if (!formData.bankName) {
        errors.bankName = 'Podaj nazwę banku';
      }
      if (!formData.accountNumber || formData.accountNumber.length < 26) {
        errors.accountNumber = 'Podaj poprawny numer konta (min. 26 znaków)';
      }
    }

    return errors;
  };