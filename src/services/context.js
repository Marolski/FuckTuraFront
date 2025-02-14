import React, { createContext, useState, useContext } from 'react';

const InvoiceContext = createContext();

export const useInvoiceContext = () => {
  return useContext(InvoiceContext);
};

export const InvoiceProvider = ({ children }) => {
  const [invoiceAdded, setInvoiceAdded] = useState(false);

  const markInvoiceAsAdded = () => {
    setInvoiceAdded(true);
  };

  const resetInvoiceAdded = () => {
    setInvoiceAdded(false);
  };

  return (
    <InvoiceContext.Provider value={{ invoiceAdded, markInvoiceAsAdded, resetInvoiceAdded }}>
      {children}
    </InvoiceContext.Provider>
  );
};
