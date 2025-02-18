export const calculateVAT = (netAmount, vatRate, quantity) => {
    if (!netAmount || !vatRate || !quantity) return 0;
    const vatValue = (parseFloat(netAmount) * (parseFloat(vatRate) / 100)) * quantity;
    return vatValue;
  };
export const calculateGrossAmount = (netAmount, vatAmount, quantity) => {
    if (!netAmount || !quantity) return 0;
    const grossValue = (parseFloat(netAmount)* quantity) + parseFloat(vatAmount);
    return grossValue;
  };
export const calculateNetSum = (netAmount, quantity) => {
    if (!netAmount || !quantity) return 0;
    const sumNet = parseFloat(netAmount) * parseFloat(quantity);
    return sumNet;
  }; 