import {
  Typography, Grid, Divider, Box, Paper,
  TableContainer, Table, TableCell, TableBody, TableHead,
  TableRow, Menu, MenuItem, IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useEffect, useState } from 'react';
import { invoiceAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { emailAPI } from '../services/api';

const insertLineBreaksEveryThreeWords = (text) => {
  if (!text) return '';
  const words = text.split(' ');
  const result = [];
  words.forEach((word, index) => {
    result.push(word + ' ');
    if ((index + 1) % 3 === 0) result.push(<br key={index} />);
  });
  return result;
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSendEmail = async () => {
      try {
          const email = 'mbrzoska303@gmail.com'; // <-- tu podmień na dynamiczny adres, np. invoice.buyerEmail
          const subject = `Faktura ${invoice.number}`;
          const body = 'Dziękujemy za współpracę! W załączniku przesyłamy fakturę.';

          // Zakładamy, że masz pdfBlob wygenerowany z html2pdf
          const element = document.getElementById('invoice-pdf');
          const pdfBlob = await html2pdf().from(element).outputPdf('blob');

          await emailAPI.sendInvoice(email, subject, body, new File([pdfBlob], 'invoice.pdf', { type: 'application/pdf' }));

          alert('Mail został wysłany!');
      } catch (error) {
          console.error('Błąd przy wysyłaniu maila:', error);
          alert('Nie udało się wysłać maila.');
      }
  };


  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await invoiceAPI.getById(id);
        setInvoice(response);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      }
    };
    fetchInvoiceDetails();
  }, [id]);

  const generatePDF = () => {
    const element = document.getElementById('invoice-pdf');
    const summarySection = document.getElementById('summary-section');

    // Ukryj sekcję podczas generowania PDF
    if (summarySection) summarySection.style.display = 'none';

    const options = {
      margin: 0.5,
      filename: `Faktura_${invoice.number}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        // Przywróć sekcję po wygenerowaniu PDF
        if (summarySection) summarySection.style.display = 'block';
      });

    handleMenuClose();
  };

  if (!invoice) {
    return <Typography align="center" mt={10}>Ładowanie szczegółów faktury...</Typography>;
  }

  const totalNet = invoice.products.reduce((sum, p) => sum + parseFloat(p.netAmount), 0);
  const totalVat = invoice.products.reduce((sum, p) => sum + parseFloat(p.vatAmount), 0);
  const totalGross = invoice.products.reduce((sum, p) => sum + parseFloat(p.grossAmount), 0);

  return (
    <Box sx={{ mt: { xs: 8, md: 15 }, px: 2, width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 900 }}>
        {/* Ikona menu w rogu */}
        <IconButton
          aria-label="więcej"
          aria-controls={open ? 'actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleMenuClick}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={generatePDF}>Generuj PDF</MenuItem>
          <MenuItem onClick={() => { navigate(`/createInvoice/${id}`); handleMenuClose(); }}>Edytuj</MenuItem>
          <MenuItem onClick={() => { handleSendEmail(); handleMenuClose(); }}>Wyślij na email</MenuItem>

        </Menu>

        {/* Faktura */}
        <Paper id="invoice-pdf" elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, width: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
            Faktura VAT
          </Typography>
          <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4 }}>
            {invoice.number}
          </Typography>

          {/* Data wystawienia i Data sprzedaży obok siebie */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ width: '48%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Data wystawienia:</Typography>
              <Typography>{new Date(invoice.invoiceDate).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ width: '48%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Data sprzedaży:</Typography>
              <Typography>{new Date(invoice.saleDate).toLocaleDateString()}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Sprzedawca i Kupujący obok siebie */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ width: '48%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Sprzedawca:</Typography>
              <Typography>{invoice.sellerName}</Typography>
              {invoice.sellerAddress && invoice.sellerAddress !== 'null' && invoice.sellerAddress !== '' && (
                <Typography>{invoice.sellerAddress}</Typography>
              )}
              <Typography>NIP: {invoice.sellerNIP}</Typography>
            </Box>
            <Box sx={{ width: '48%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Kupujący:</Typography>
              <Typography>{invoice.buyerName}</Typography>
              {invoice.buyerAddress && invoice.buyerAddress !== 'null' && invoice.buyerAddress !== '' && (
                <Typography>{invoice.buyerAddress}</Typography>
              )}
              <Typography>NIP: {invoice.buyerNIP}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Termin płatności i Metoda płatności obok siebie */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ width: '48%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Termin płatności:</Typography>
              <Typography>{new Date(invoice.dateOfPayment).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ width: '48%' }}>
              <Typography variant="subtitle1" fontWeight="bold">Metoda płatności:</Typography>
              <Typography>{invoice.payment === 'bank_transfer' ? 'Przelew bankowy' : 'Gotówka'}</Typography>
            </Box>
          </Box>

          {invoice.payment === 'bank_transfer' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ width: '48%' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Nazwa banku:</Typography>
                  <Typography>{invoice.bankName}</Typography>
                </Box>
                <Box sx={{ width: '48%' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Numer konta:</Typography>
                  <Typography>{invoice.accountNumber}</Typography>
                </Box>
              </Box>
            </>
          )}


          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main">Produkty</Typography>
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
                  {invoice.products.map((product, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '200px' }}>
                        {insertLineBreaksEveryThreeWords(product.productName)}
                      </TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">
                        {parseFloat(product.netAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </TableCell>
                      <TableCell align="right">{product.vatRate}</TableCell>
                      <TableCell align="right">
                        {parseFloat(product.vatAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(product.grossAmount).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    <TableCell colSpan={2}>Razem</TableCell>
                    <TableCell align="right">
                      {totalNet.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </TableCell>
                    <TableCell />
                    <TableCell align="right">
                      {totalVat.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </TableCell>
                    <TableCell align="right">
                      {totalGross.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box id="summary-section" sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">Status:</Typography>
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
            <Divider sx={{ my: 2 }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
            <Box sx={{ width: '48%', border: '1px solid black', textAlign: 'center', pt: 2, height: 80 }}>
              <Typography variant="subtitle2">Podpis wystawiającego</Typography>
            </Box>
            <Box sx={{ width: '48%', border: '1px solid black', textAlign: 'center', pt: 2, height: 80 }}>
              <Typography variant="subtitle2">Podpis odbierającego</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default InvoiceDetail;
