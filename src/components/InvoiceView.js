import { Card, CardContent, Typography, Grid, Divider, Box, Paper,TableContainer, Table, TableCell,TableBody,TableHead, TableRow, Button, autocompleteClasses } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { invoiceAPI } from '../services/api';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js'; // Import html2pdf.js
import { useNavigate } from 'react-router-dom'; // Importuj useNavigate

const InvoiceDetail = () => {
  const { id } = useParams(); // Pobierz id faktury z URL
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await invoiceAPI.getById(id); // Przykładowa metoda API
        setInvoice(response);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      }
    };

    fetchInvoiceDetails();
  }, [id]);

  const generatePDF = () => {
    const element = document.getElementById('invoice-pdf');
    const summarySection = document.getElementById('summary-section'); // Pobranie sekcji statusu
  
    const parent = summarySection ? summarySection.parentNode : null;
    console.log(parent)
    const removedSection = summarySection;
    console.log(removedSection)

    // Sprawdzenie, czy element istnieje przed próbą usunięcia
    if (summarySection && parent)
      parent.removeChild(summarySection);
  
    const options = {
      margin: 5, // Równomierne marginesy
      filename: `Faktura_${invoice.number}.pdf`,
      image: { type: 'jpeg', quality: 1.0 }, // Maksymalna jakość obrazu
      html2canvas: {
        scale: 3, // Zwiększenie skali dla lepszej jakości
        useCORS: true, // Obsługa zasobów zewnętrznych
        logging: false,
        dpi: 300,
        letterRendering: true,
        width: 800, // Wymuszenie szerokości w px (odpowiednik A4)
        height: 900 // Dynamiczna wysokość
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };
  
    html2pdf()
      .set(options)
      .from(element)
      .toCanvas()
      .toPdf()
      .get('pdf')
      .then(pdf => {
        pdf.internal.scaleFactor = 1.1; // Wymuszenie większej skali
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(11); // Dopasowanie czcionki
        }
      })
      .save()
      .then(() => {
        parent.appendChild(removedSection); 
      });
  };
  
  
  

  if (!invoice) {
    return <Typography>Ładowanie szczegółów faktury...</Typography>;
  }

  return (
    <Box sx={{ mt: 15, width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 'auto' }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', width:'70%' }}>
          <Button variant="contained" color="primary" onClick={() => generatePDF()}>
            Generuj PDF
          </Button>
          <Button variant="contained" color="primary" onClick={() => { navigate(`/createInvoice/${id}`); }}>
            Edytuj
          </Button>
        </Box>
  
        <div id="invoice-pdf">
          <Paper elevation={4} sx={{ width: '100%', margin: 'auto', padding: 3, borderRadius: 2 }}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
              Faktura VAT
            </Typography>
            <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4 }}>
              {invoice.number}
            </Typography>
  
            <Box>
              <Grid container spacing={15}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Data wystawienia:
                  </Typography>
                  <Typography>{new Date(invoice.invoiceDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Data sprzedaży:
                  </Typography>
                  <Typography>{new Date(invoice.saleDate).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
  
              <Divider sx={{ my: 1 }} />
  
              <Grid container spacing={15}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Sprzedawca:
                  </Typography>
                  <Typography>{invoice.sellerName}</Typography>
                  <Typography>{invoice.sellerAddress}</Typography>
                  <Typography>NIP: {invoice.sellerNIP}</Typography>
                </Grid>
  
                <Grid item xs={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Kupujący:
                  </Typography>
                  <Typography>{invoice.buyerName}</Typography>
                  <Typography>{invoice.buyerAddress}</Typography>
                  <Typography>NIP: {invoice.buyerNIP}</Typography>
                </Grid>
              </Grid>
            </Box>
  
            <Divider sx={{ my: 1 }} />
  
            <Grid container spacing={15}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Termin płatności:
                </Typography>
                <Typography>{new Date(invoice.dateOfPayment).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Metoda płatności:
                </Typography>
                <Typography>{invoice.payment === 'bank_transfer' ? 'Przelew bankowy' : 'Gotówka'}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={15} sx={{ display: invoice.payment === 'cash' ? 'none' : 'flex' }}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Nazwa banku:
                </Typography>
                <Typography>{invoice.bankName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Numer konta:
                </Typography>
                <Typography>{invoice.accountNumber}</Typography>
              </Grid>
            </Grid>
  
            <Divider sx={{ my: 1 }} />
  
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Produkty</Typography>
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nazwa produktu</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ilość</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Kwota netto</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Stawka VAT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Kwota VAT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Kwota brutto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{parseFloat(product.netAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</TableCell>
                        <TableCell>{product.vatRate}</TableCell>
                        <TableCell>{parseFloat(product.vatAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</TableCell>
                        <TableCell>{parseFloat(product.grossAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</TableCell>
                      </TableRow>
                    ))}
                    {/* Wiersz podsumowania */}
                    <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                      <TableCell sx={{ fontWeight: 'bold' }} colSpan={2}>Razem</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {invoice.products
                          .reduce((sum, product) => sum + parseFloat(product.netAmount), 0)
                          .toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {invoice.products
                          .reduce((sum, product) => sum + parseFloat(product.vatAmount), 0)
                          .toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {invoice.products
                          .reduce((sum, product) => sum + parseFloat(product.grossAmount), 0)
                          .toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
  
            <Box id="parrent-section">
              <Box id="summary-section" sx={{ '@media print': { display: 'none' } }}>
                <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                  <Grid item sx={{ display: 'block' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Status:</Typography>
                    <Typography 
                      color={
                        invoice.status === 1 ? 'green' : 
                        invoice.status === 3 ? 'red' : 
                        invoice.status === 4 ? 'grey' : 'orange'
                      }
                    >
                      {invoice.status === 1 && 'Opłacona'}
                      {invoice.status === 3 && 'Anulowana'}
                      {invoice.status === 4 && 'Szkic'}
                      {(invoice.status === 0 || invoice.status === 2) && 'Nieopłacona'}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
              </Box>
            </Box>
  
            <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
              <Box sx={{ width: '45%', height: 80, border: '1px solid black', textAlign: 'center', pt: 2 }}>
                <Typography variant="subtitle2">Podpis wystawiającego</Typography>
              </Box>
              <Box sx={{ width: '45%', height: 80, border: '1px solid black', textAlign: 'center', pt: 2 }}>
                <Typography variant="subtitle2">Podpis odbierającego</Typography>
              </Box>
            </Grid>
          </Paper>
        </div>
    </Box>
  );  
};

export default InvoiceDetail;
