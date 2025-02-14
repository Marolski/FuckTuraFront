export const mapDateToDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    
    // Wyciąganie dnia, miesiąca i roku
    const day = String(date.getDate()).padStart(2, '0'); // Dodaje zero na początku, jeśli dzień ma jedną cyfrę
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0, dlatego dodajemy 1
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };

  export const parseInvoiceNumber = (invoiceNumber) => {
    const match = invoiceNumber.match(/F(\d+)\/(\d{2})\/(\d{4})/); // Dopasowanie FDD/MM/YYYY
    if (match) {
      const number = parseInt(match[1], 10); // Pobierz numer jako liczbę
      const month = parseInt(match[2], 10); // Pobierz miesiąc jako liczbę
      const year = parseInt(match[3], 10); // Pobierz rok jako liczbę
      return { number, month, year };
    }
    return { number: 0, month: 0, year: 0 }; // Wartość domyślna, gdy format nie pasuje
  };
  

  