export const roundTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};


export const calculateNetSum = (netAmount, quantity) => {
  const result = parseFloat(netAmount) * parseFloat(quantity);
  return roundTwoDecimals(result);
};

export const calculateVAT = (netAmount, vatRate, quantity) => {
  const netSum = calculateNetSum(netAmount, quantity);
  const vatPercentage = parseFloat(vatRate.replace('%', '')) / 100;
  const result = netSum * vatPercentage;
  return roundTwoDecimals(result);
};

export const calculateGrossAmount = (netAmount, vatAmount, quantity) => {
  const netSum = calculateNetSum(netAmount, quantity);
  const vat = parseFloat(vatAmount);
  const result = netSum + vat;
  return roundTwoDecimals(result);
};
