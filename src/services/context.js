import React, { createContext, useState, useContext } from 'react';

const InvoiceContext = createContext();

export const useInvoiceContext = () => {
  return useContext(InvoiceContext);
};

export const InvoiceProvider = ({ children }) => {
  const [invoiceAction, setInvoiceAction] = useState({
    triggered: false,
    wasUpdate: false,
  });

  const [businessAdded, setBusinessAdded] = useState(false);

  const markInvoiceAsAdded = (wasUpdate = false) => {
    setInvoiceAction({ triggered: true, wasUpdate });
  };

  const resetInvoiceAction = () => {
    setInvoiceAction({ triggered: false, wasUpdate: false });
  };

  const markBusinessAsAdded = () => {
    setBusinessAdded(true);
  };

  const resetBusinessAdded = () => {
    setBusinessAdded(false);
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoiceAction,
        markInvoiceAsAdded,
        resetInvoiceAction,
        businessAdded,
        markBusinessAsAdded,
        resetBusinessAdded,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
