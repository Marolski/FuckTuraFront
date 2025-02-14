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