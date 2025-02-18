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

  export const validateClientForm = (clientData) => {
    let errors = {};
  
    // Walidacja NIP
    if (!clientData.nip) {
      errors['nip'] = ['Numer NIP jest obowiązkowy'];
    } else if (clientData.nip.length < 10) {
      errors['nip'] = ['Numer NIP musi zawierać co najmniej 10 znaków'];
    } else {
      // Regex do walidacji formatu NIP (10 cyfr)
      const nipRegex = /^[0-9]{10}$/;
      if (!nipRegex.test(clientData.nip)) {
        errors['nip'] = ['Numer NIP jest nieprawidłowy'];
      }
    }
  
    // Walidacja Name
    if (!clientData.name) {
      errors['name'] = ['Nazwa klienta jest obowiązkowa'];
    } else if (clientData.name.length <= 5) {
      errors['name'] = ['Nazwa klienta musi zawierać więcej niż 5 znaków'];
    }
  
    // Walidacja Address
    if (!clientData.address) {
      errors['address'] = ['Adres jest obowiązkowy'];
    } else if (clientData.address.length <= 5) {
      errors['address'] = ['Adres musi zawierać więcej niż 5 znaków'];
    }
    return errors;
  };
  
  