export const sortByDate = (invoices) => {
    return invoices.sort((a, b) => {
        // Funkcja do parsowania daty w formacie DD-MM-YYYY na obiekt Date
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('-');
            return new Date(`${month}-${day}-${year}`);
        };

        // Parsowanie dat do obiektów Date
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);

        // Porównanie dat
        return dateB - dateA;
    });
};

export const sortData = (rows, order, orderBy) => {
    return rows.sort((a, b) => {
      if (orderBy === 'price') {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        
        return order === 'desc' 
          ? priceB - priceA 
          : priceA - priceB;
      }
  
      if (orderBy === 'date') {
        const parseDate = (dateString) => {
          const [day, month, year] = dateString.split('-');
          return new Date(`${month}-${day}-${year}`);
        };
  
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
  
        // Porównanie dat
        return order === 'desc' ? dateB - dateA : dateA - dateB;
      }
  
      if (orderBy === 'status') {
        return order === 'desc'
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
  
      if (orderBy === 'client' || orderBy === 'business') {
        return order === 'desc'
          ? b[orderBy].localeCompare(a[orderBy])
          : a[orderBy].localeCompare(b[orderBy]);
      }
  
      if (orderBy === 'number') {
        const parseInvoiceNumber = (invoice) => {
          const match = invoice.number.match(/^F(\d{2})\/(\d{2})\/(\d{4})$/);
          if (match) {
            const number = parseInt(match[1], 10); // numer faktury
            const month = parseInt(match[2], 10); // miesiąc
            const year = parseInt(match[3], 10); // rok
            return { number, month, year };
          }
          return { number: 0, month: 0, year: 0 }; // W przypadku błędnego formatu
        };
  
        const invoiceA = parseInvoiceNumber(a);
        const invoiceB = parseInvoiceNumber(b);
  
        if (order === 'desc') {
          return invoiceB.year !== invoiceA.year
            ? invoiceB.year - invoiceA.year
            : invoiceB.month !== invoiceA.month
            ? invoiceB.month - invoiceA.month
            : invoiceB.number - invoiceA.number;
        } else {
          return invoiceA.year !== invoiceB.year
            ? invoiceA.year - invoiceB.year
            : invoiceA.month !== invoiceB.month
            ? invoiceA.month - invoiceB.month
            : invoiceA.number - invoiceB.number;
        }
      }
  
      // Default case for other columns
      return 0;
    });
  };
  