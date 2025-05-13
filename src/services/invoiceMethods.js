import { invoiceAPI, customerBusinessAPI, userBusinessAPI } from './api';
import dayjs from 'dayjs';
import { calculateVAT, calculateGrossAmount } from '../services/calculator';

export const createInvoiceNumber = async (nip) => {
    try {
      //Pobierz faktury
      const response = await invoiceAPI.getByNIP(nip, true);
      const currentDate = new Date();
      //Przygotuj format MM/YYYY 
      const currentMonthYear = String(currentDate.getMonth() + 1).padStart(2, '0')+'/'+currentDate.getFullYear();
      //Jeśli są faktury to:
      // - pobierz same numery
      // - wybierz faktury z aktualnego MM/YYYY
      if (response && response.length > 0) {
        const invoiceNumbers = response.map(invoice => invoice.number);
        const numbersFromCurrentMonth = invoiceNumbers.filter(number => {
            return number.includes(currentMonthYear);
        });
      // Jeśli są faktury z aktualnego miesiąca to je posortuj
        if(numbersFromCurrentMonth.length>0){
            numbersFromCurrentMonth.sort();
      // Wyciągnij sam numer faktury z F'XX' i zwiększ o jeden
            const lastOneNumber = numbersFromCurrentMonth[numbersFromCurrentMonth.length-1].split('/')[0].slice(1);
            if(lastOneNumber[0]==='0' && lastOneNumber!=='09')
            return 'F0'+(parseFloat(lastOneNumber)+parseFloat(1.0))+'/'+currentMonthYear;
          else return 'F'+(parseFloat(lastOneNumber)+parseFloat(1.0))+'/'+currentMonthYear;
        } else return 'F01/'+currentMonthYear;
      } else return 'F01/'+currentMonthYear;
    } catch (error) {
      console.error('Błąd podczas pobierania faktur:', error);
    }
  };

  export const saveInvoice = async (formData, products, draft, id) => {
    const invoiceData = {
      number: formData.number,
      sellerName: formData.sellerName,
      sellerAddress: formData.sellerAddress,
      sellerNip: formData.sellerNip,
      buyerName: formData.buyerName,
      buyerAddress: formData.buyerAddress,
      buyerNIP: formData.buyerNIP,
      saleDate: formData.saleDate,
      invoiceDate: formData.invoiceDate,
      dateOfPayment: formData.dateOfPayment,
      payment: formData.payment,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      products: products.map((product) => ({
        productName: product.productName,
        quantity: parseInt(product.quantity),
        netAmount: parseFloat(product.netAmount),
        vatRate: product.vatRate,
        vatAmount: parseFloat(product.vatAmount),
        grossAmount: parseFloat(product.grossAmount),
      })),
    };
    if (draft) invoiceData.status = 4;
    try {
      if (typeof id === 'string' && /^\d+$/.test(id)) {
        await invoiceAPI.updateById(id, invoiceData);
        console.log("Faktura pomyślnie zaktualizowana.");
        return true; // oznacza update
      } else {
        await invoiceAPI.create(invoiceData);
        console.log("Faktura zapisana pomyślnie.");
        return false; // oznacza nowa
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania faktury:", error);
      alert("Wystąpił błąd przy zapisywaniu faktury.");
      return false;
    }
  };
  

  export const createSellerAddress = (street, buildingNum, apartmentNum, city, postalCode, country) => {
    console.log(apartmentNum)
    const buildingPart = apartmentNum ? `${buildingNum}/${apartmentNum}` : buildingNum;
    return `${street} ${buildingPart}, ${postalCode} ${city}, ${country}`;
  };
  

export const fetchClientsForSeller = async (sellerId, setClients) => {
  try {
    const response = await customerBusinessAPI.getByBusinessId(sellerId); // Zakładam, że masz endpoint dla klientów powiązanych ze sprzedawcą
    setClients(response);
  } catch (error) {
    console.error('Błąd podczas pobierania klientów:', error);
  }
  };

export const fetchBusinessDetails = async (invoiceNumber, setSellers, setClients, setFormData, setSelectedBusinessId) => {
  try {
    let sellerAddress = '';
    const sellerResponse = await userBusinessAPI.get();
    if (sellerResponse && sellerResponse.length > 0) {
      setSellers(sellerResponse);
      const { companyName, id, nipNumber } = sellerResponse[0];
      setSelectedBusinessId(id);
      sellerAddress = createSellerAddress(
        sellerResponse[0].street,
        sellerResponse[0].buildingNumber,
        sellerResponse[0].apartmentNumber,
        sellerResponse[0].city,
        sellerResponse[0].postalCode,
        sellerResponse[0].country
      );
      let invoiceNum = invoiceNumber;
      if(invoiceNumber==='')
        invoiceNum = await createInvoiceNumber(nipNumber);
      fetchClientsForSeller(id, setClients);
      setFormData((prevData) => ({
        ...prevData,
        sellerName: companyName,
        sellerAddress: sellerAddress,
        sellerNip: nipNumber,
        number: invoiceNum
      }));
    }
  } catch (error) {
    console.error('Błąd podczas pobierania danych sprzedawcy:', error);
  }
};

export const fetchInvoiceDetails = async (
  invoiceId,
  formData,
  setFormData,
  setProducts,
  setSellers,
  setClients,
  setSelectedBusinessId
) => {
  try {
    const invoiceResponse = await invoiceAPI.getById(invoiceId); // Pobierz fakturę
    if (invoiceResponse) {
      const {
        sellerName, buyerName, buyerNIP, buyerAddress,
        saleDate, invoiceDate, dateOfPayment, payment,
        bankName, accountNumber, products, number
      } = invoiceResponse;

      // Najpierw pobierz sprzedawców
      const sellersResponse = await userBusinessAPI.get();
      setSellers(sellersResponse);

      // Znajdź sprzedawcę na podstawie nazwy
      const matchedSeller = sellersResponse.find(s => s.companyName === sellerName);
      const matchedSellerId = matchedSeller ? matchedSeller.id : '';

      setSelectedBusinessId(matchedSellerId);

      const sellerAddress = matchedSeller
        ? createSellerAddress(
            matchedSeller.street,
            matchedSeller.buildingNumber,
            matchedSeller.apartmentNumber,
            matchedSeller.city,
            matchedSeller.postalCode,
            matchedSeller.country
          )
        : '';

      const sellerNip = matchedSeller ? matchedSeller.nipNumber : '';

      // Ustaw formData z sellerId, sellerAddress, sellerNip
      setFormData({
        ...formData,
        sellerId: matchedSellerId,
        sellerName,
        sellerAddress,
        sellerNip,
        buyerName,
        buyerAddress,
        buyerNIP,
        saleDate: dayjs(saleDate),
        invoiceDate: dayjs(invoiceDate),
        dateOfPayment: dayjs(dateOfPayment),
        payment,
        bankName,
        accountNumber,
        number
      });

      setProducts(products);

      // Pobierz klientów dla tego sprzedawcy (jeśli znaleziony)
      if (matchedSellerId) {
        fetchClientsForSeller(matchedSellerId, setClients);
      }
    }
  } catch (error) {
    console.error('Błąd podczas pobierania szczegółów faktury:', error);
  }
};


export const handleSellerChange = async (sellerId, sellers, setSelectedBusinessId, setClients, setFormData) => {
  const selectedSeller = sellers.find((seller) => seller.id === sellerId);
  if (!selectedSeller) {
    console.error('Nie znaleziono sprzedawcy o podanym ID');
    return;
  }

  let invoiceNum = '';
  let sellerAddress = createSellerAddress(
    selectedSeller.street,
    selectedSeller.buildingNumber,
    selectedSeller.apartmentNumber,
    selectedSeller.city,
    selectedSeller.postalCode,
    selectedSeller.country
  );

  setSelectedBusinessId(selectedSeller.id);
  fetchClientsForSeller(selectedSeller.id, setClients);
  invoiceNum = await createInvoiceNumber(selectedSeller.nipNumber);

  setFormData((prevData) => ({
    ...prevData,
    sellerId: selectedSeller.id,
    sellerName: selectedSeller.companyName,
    sellerAddress: sellerAddress,
    sellerNip: selectedSeller.nipNumber,
    buyerName: '',
    number: invoiceNum
  }));
};


export const handleErrorChange = (name, setFormErrors) =>{
  setFormErrors((prevErrors) => {
    const newErrors = { ...prevErrors };
    delete newErrors[name];
    return newErrors;
  });
}

////METODY DOTYCZACE PRODUKTU//////////////
export const handleProductChange = (index, event, setProducts, products, setFormErrors) => {
  const { name, value } = event.target;
  const updatedProducts = [...products];
  updatedProducts[index][name] = value;

  const vatAmount = calculateVAT(updatedProducts[index].netAmount, updatedProducts[index].vatRate, updatedProducts[index].quantity);
  const grossAmount = calculateGrossAmount(updatedProducts[index].netAmount, vatAmount, updatedProducts[index].quantity);

  updatedProducts[index].vatAmount = vatAmount;
  updatedProducts[index].grossAmount = grossAmount;

  setProducts(updatedProducts);
  handleErrorChange(`${name}_${index}`, setFormErrors);
};

export const addProduct = (products, setProducts) => {
  setProducts([...products, { productName: '', quantity: 1, netAmount: 0, vatRate: '5%', vatAmount: 0, grossAmount: 0 }]);
};

export const removeProduct = (index, products, setProducts) => {
  const updatedProducts = products.filter((_, i) => i !== index);
  setProducts(updatedProducts);
};

/////METODY DOTYCZACE KLIENTA/////////////

export const handleClientChange = (value, clients, setFormData, setFormErrors) => {
  const selectedBuyer = clients.find((buyer) => buyer.name === value);
  if(selectedBuyer){
    setFormData((prevData) => ({
      ...prevData,
      buyerName: value,
      buyerAddress: selectedBuyer.address,
      buyerNIP: selectedBuyer.nip,

    }));
    handleErrorChange('buyerName', setFormErrors);
  }
}