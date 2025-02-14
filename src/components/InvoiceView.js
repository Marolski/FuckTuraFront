import { Card, CardContent, Typography, Grid, Divider, Box, Paper,TableContainer, Table, TableCell,TableBody,TableHead, TableRow, Button } from '@mui/material';
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
    const element = document.getElementById('invoice-pdf'); // Zidentyfikuj element do wygenerowania PDF

    const options = {
      margin:       0.5, // Ustaw marginesy na małe, aby zaoszczędzić miejsce
      filename:     `Faktura_${invoice.number}.pdf`,
      html2canvas:  { scale: 2, logging: false, dpi: 300 }, // Ustaw wyższą rozdzielczość
      jsPDF:        { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait', 
        compress: true, 
        pageSize: 'A4', // Format A4
        autoPaging: true, // Automatycznie dopasowuje do strony
        maxWidth: 595, // Maksymalna szerokość strony A4 w jednostkach 'in'
        maxHeight: 842, // Maksymalna wysokość strony A4
        putOnlyUsedFonts: true,
        scale: 0.8 // Skaluje zawartość, aby zmieściła się na jednej stronie
      }
    };

    html2pdf().from(element).set(options).save(); // Generowanie PDF
  };

  if (!invoice) {
    return <Typography>Ładowanie szczegółów faktury...</Typography>;
  }

  return (
  <div>
    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
      <Button variant="contained" color="primary" onClick={() => generatePDF()}>
        Generuj PDF
      </Button>
      <Button variant="contained" color="primary" onClick={() => {navigate(`/createInvoice/${id}`); console.log(id)}}>
        Edytuj
      </Button>
    </Box>
    <div id="invoice-pdf">
      <Paper elevation={4} sx={{ maxWidth: '800px', margin: 'auto', padding: 3, borderRadius: 2 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
        Faktura VAT
      </Typography>
      <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4 }}>
        {invoice.number}
      </Typography>

      <Box>
        <Grid container spacing={15}>
          {/* Przenosimy daty nad dane sprzedawcy i kupującego */}
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
          {/* Dane sprzedawcy */}
          <Grid item xs={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Sprzedawca:
            </Typography>
            <Typography>{invoice.sellerName}</Typography>
            <Typography>{invoice.sellerAddress}</Typography>
            <Typography>NIP: {invoice.sellerNIP}</Typography>
          </Grid>

          {/* Dane kupującego */}
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Produkty
        </Typography>
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
              {invoice.product.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{parseFloat(product.netAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</TableCell>
                  <TableCell>{product.vatRate}</TableCell>
                  <TableCell>{parseFloat(product.vatAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</TableCell>
                  <TableCell>{parseFloat(product.grossAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Łącznie</TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {parseFloat(invoice.product.reduce((acc, product) => acc + product.netAmount, 0)).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                </TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {parseFloat(invoice.product.reduce((acc, product) => acc + product.vatAmount, 0)).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {parseFloat(invoice.product.reduce((acc, product) => acc + product.grossAmount, 0)).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Podsumowanie
        </Typography>
        <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
          <Grid item>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Status:
            </Typography>
            <Typography 
              color={
                invoice.status === 1 ? 'green' : 
                invoice.status === 3 ? 'red' : 
                invoice.status === 4 ? 'grey' : 
                'orange'
              }
            >
              {invoice.status === 1 && 'Opłacona'}
              {invoice.status === 3 && 'Anulowana'}
              {invoice.status === 4 && 'Szkic'}
              {(invoice.status === 0 || invoice.status === 2) && 'Nieopłacona'}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Kwota:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {parseFloat(invoice.amount).toLocaleString('pl-PL', {
                style: 'currency',
                currency: 'PLN'
              })}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
    </div>
  </div>
  );
};

export default InvoiceDetail;
