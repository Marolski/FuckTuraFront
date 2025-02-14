// enumMapper.js
export const mapStatusEnumToString = (status) => {
    const statusMapping = {
      0: 'Wystawiona',
      1: 'Opłacona',
      2: 'Nieopłacona ',
      3: 'Anulowana',
      4: 'Szkic'
      // Add more mappings as necessary
    };
  
    return statusMapping[status] || 'Unknown';
  };
  