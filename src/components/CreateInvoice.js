import { useState, useEffect } from 'react';
import {
  Box, Button, Paper, TextField, Typography, MenuItem, IconButton, Grid,
  Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import NewClientModal from '../modals/NewClientModal';
import SellerSelectionModal from '../modals/SelectBusiness';
import {
  calculateVAT, calculateGrossAmount, calculateNetSum
} from '../services/calculator';
import {
  saveInvoice, fetchBusinessDetails, fetchInvoiceDetails, handleSellerChange,
  handleErrorChange, handleProductChange, removeProduct, addProduct,
} from '../services/invoiceMethods';
import { validateForm } from '../services/validator';
import { useNavigate, useParams } from 'react-router-dom';
import { useInvoiceContext } from '../services/context';

const CreateInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markInvoiceAsAdded } = useInvoiceContext();

  const [formData, setFormData] = useState({
    sellerId: '', sellerName: '', sellerAddress: '', sellerNip: '',
    buyerName: '', buyerAddress: '', buyerNIP: '',
    saleDate: dayjs(), invoiceDate: dayjs(), dateOfPayment: dayjs(),
    payment: 'bank_transfer', bankName: '', accountNumber: '', number: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([
    { productName: '', quantity: 1, netAmount: 0, vatRate: '5%', vatAmount: 0, grossAmount: 0 },
  ]);
  const [sellers, setSellers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [openSelectSellerModal, setOpenSelectSellerModal] = useState(false);
  const [loadingFinished, setLoadingFinished] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const load = async () => {
      if (id) {
        await fetchInvoiceDetails(id, formData, setFormData, setProducts, setSellers, setClients, setSelectedBusinessId);
      } else {
        await fetchBusinessDetails(formData.number, setSellers, setClients, setFormData, setSelectedBusinessId);
      }
      setLoadingFinished(true);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id && loadingFinished && sellers.length === 0) {
      setOpenSelectSellerModal(true);
    }
  }, [id, loadingFinished, sellers]);

  const handleClientAdd = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleClientSave = (newClient, message) => {
    setClients(prev => [...prev, newClient]);
    setFormData(prev => ({
      ...prev,
      buyerName: newClient.name,
      buyerAddress: newClient.address,
      buyerNIP: newClient.nip,
    }));
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const handleClientChange = (value) => {
    const selectedBuyer = clients.find((b) => b.name === value);
    if (selectedBuyer) {
      setFormData(prev => ({
        ...prev,
        buyerName: value,
        buyerAddress: selectedBuyer.address,
        buyerNIP: selectedBuyer.nip,
      }));
      handleErrorChange('buyerName', setFormErrors);
    }
  };

  const handleSave = async (draft, id) => {
    const validationErrors = validateForm(formData, products);
    if (Object.keys(validationErrors).length > 1) {
      setFormErrors(validationErrors);
    } else {
      const wasUpdate = await saveInvoice(formData, products, draft, id);
      markInvoiceAsAdded(wasUpdate);
      navigate('/invoices');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    handleErrorChange(e.target.name, setFormErrors);
  };

  const handleSelectSeller = (id) => {
    const selectedSeller = sellers.find((s) => s.id === id);
    if (selectedSeller) {
      setSelectedBusinessId(id);
      handleSellerChange(selectedSeller.companyName, sellers, setSelectedBusinessId, setClients, setFormData);
    }
    setOpenSelectSellerModal(false);
  };

  const handleAddNewSeller = () => {
    setOpenSelectSellerModal(false);
    navigate('/bussiness');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: { xs: 8, md: 15 }, px: 2 }}>
        <Paper elevation={3} sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
          <Typography variant="h6" align="center" gutterBottom>Numer Faktury: {formData.number}</Typography>

          <Typography variant="subtitle1" align="center" sx={{ mt: 2, mb: 1 }}>Daty</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data Sprzedaży"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data Wystawienia"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>Płatność</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Sposób Płatności"
                name="payment"
                select
                fullWidth
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              >
                <MenuItem value="bank_transfer">Przelew</MenuItem>
                <MenuItem value="cash">Gotówka</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data Płatności"
                value={formData.dateOfPayment}
                onChange={(e) => setFormData({ ...formData, dateOfPayment: e })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            {formData.payment === 'bank_transfer' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nazwa Banku"
                    name="bankName"
                    fullWidth
                    value={formData.bankName}
                    onChange={handleChange}
                    error={!!formErrors.bankName}
                    helperText={formErrors.bankName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Numer Konta"
                    name="accountNumber"
                    fullWidth
                    value={formData.accountNumber}
                    onChange={handleChange}
                    error={!!formErrors.accountNumber}
                    helperText={formErrors.accountNumber}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }} variant="subtitle1">Sprzedający</Typography>
              <TextField
                label="Nazwa Sprzedającego"
                name="sellerId"
                select
                fullWidth
                value={formData.sellerId}
                onChange={(e) =>
                  handleSellerChange(e.target.value, sellers, setSelectedBusinessId, setClients, setFormData)
                }
              >
                {sellers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }} variant="subtitle1">Klient</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  label="Wybierz klienta"
                  name="buyerName"
                  select
                  fullWidth
                  value={formData.buyerName}
                  onChange={(e) => handleClientChange(e.target.value)}
                  error={!!formErrors.buyerName}
                  helperText={formErrors.buyerName}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.name}>{client.name}</MenuItem>
                  ))}
                </TextField>
                <IconButton onClick={handleClientAdd} color="primary" sx={{ ml: 1 }}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          <NewClientModal open={isModalOpen} onClose={handleModalClose} onSave={handleClientSave} businessId={selectedBusinessId} />

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>Produkty</Typography>
          {products.map((product, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nazwa Produktu"
                    name="productName"
                    fullWidth
                    value={product.productName}
                    onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                    error={!!formErrors[`productName_${index}`]}
                    helperText={formErrors[`productName_${index}`]}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    label="Ilość"
                    name="quantity"
                    type="number"
                    fullWidth
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                    error={!!formErrors[`quantity_${index}`]}
                    helperText={formErrors[`quantity_${index}`]}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    label="VAT"
                    name="vatRate"
                    select
                    fullWidth
                    value={product.vatRate}
                    onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                  >
                    <MenuItem value="5%">5%</MenuItem>
                    <MenuItem value="10%">10%</MenuItem>
                    <MenuItem value="23%">23%</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  {index > 0 && (
                    <IconButton
                      onClick={() => removeProduct(index, products, setProducts)}
                      color="secondary"
                      sx={{ mt: 1 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Cena Netto"
                    name="netAmount"
                    type="number"
                    fullWidth
                    value={product.netAmount}
                    onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                    error={!!formErrors[`netAmount_${index}`]}
                    helperText={formErrors[`netAmount_${index}`]}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Wartość Netto"
                    fullWidth
                    type="number"
                    value={calculateNetSum(product.netAmount, product.quantity)}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Kwota VAT"
                    fullWidth
                    type="number"
                    value={calculateVAT(product.netAmount, product.vatRate, product.quantity)}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Kwota Brutto"
                    fullWidth
                    type="number"
                    value={calculateGrossAmount(product.netAmount, calculateVAT(product.netAmount, product.vatRate, product.quantity), product.quantity)}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <IconButton onClick={() => addProduct(products, setProducts)} color="primary" sx={{ mt: 2 }}>
            <AddIcon />
          </IconButton>

          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={6}>
              <Button variant="outlined" color="primary" fullWidth onClick={() => handleSave(true, id)}>
                Zapisz Szkic
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" color="primary" fullWidth onClick={() => handleSave(false, id)}>
                Zapisz
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <SellerSelectionModal
          open={openSelectSellerModal}
          sellers={sellers}
          onClose={() => {}}
          onSelectSeller={handleSelectSeller}
          onAddNewSeller={handleAddNewSeller}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateInvoice;
