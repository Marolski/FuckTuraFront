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

  export const validateNewBusinessForm = (businessData) => {
    let errors = {};
  
    // Nazwa firmy
    if (!businessData.companyName || businessData.companyName.trim() === '') {
      errors.companyName = 'Nazwa firmy jest obowiązkowa';
    }
  
    // NIP
    if (!businessData.nipNumber || businessData.nipNumber.trim() === '') {
      errors.nipNumber = 'Numer NIP jest obowiązkowy';
    } else if (businessData.nipNumber.length < 10) {
      errors.nipNumber = 'Numer NIP musi zawierać co najmniej 10 znaków';
    } else if (!/^[0-9]{10}$/.test(businessData.nipNumber)) {
      errors.nipNumber = 'Numer NIP jest nieprawidłowy (powinien mieć 10 cyfr)';
    }
  
    // Ulica
    if (!businessData.street || businessData.street.trim() === '') {
      errors.street = 'Ulica jest obowiązkowa';
    }
  
    // Numer budynku
    if (!businessData.buildingNumber || businessData.buildingNumber.trim() === '') {
      errors.buildingNumber = 'Numer budynku jest obowiązkowy';
    }
  
    // Kod pocztowy
    if (!businessData.postalCode || businessData.postalCode.trim() === '') {
      errors.postalCode = 'Kod pocztowy jest obowiązkowy';
    }
  
    // Miasto
    if (!businessData.city || businessData.city.trim() === '') {
      errors.city = 'Miasto jest obowiązkowe';
    }
  
    // Kraj
    if (!businessData.country || businessData.country.trim() === '') {
      errors.country = 'Kraj jest obowiązkowy';
    }
  
    // Email
    if (!businessData.email || businessData.email.trim() === '') {
      errors.email = 'Email jest obowiązkowy';
    } else if (!/^\S+@\S+\.\S+$/.test(businessData.email)) {
      errors.email = 'Podaj poprawny adres email';
    }
  
    // Telefon
    if (!businessData.phoneNumber || businessData.phoneNumber.trim() === '') {
      errors.phoneNumber = 'Telefon jest obowiązkowy';
    }
  
    // REGON
    if (!businessData.regon || businessData.regon.trim() === '') {
      errors.regon = 'REGON jest obowiązkowy';
    } else if (!/^[0-9]{9}$/.test(businessData.regon)) {
      errors.regon = 'REGON powinien składać się z 9 cyfr';
    }
  
    // Forma prawna
    if (!businessData.legalForm || businessData.legalForm.trim() === '') {
      errors.legalForm = 'Forma prawna jest obowiązkowa';
    }
  
    return errors;
  };
  
  
  
  