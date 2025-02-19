import { useState, useEffect  } from 'react';
import {Box,Button,Paper,TextField,Typography,MenuItem,IconButton,Grid} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import NewClientModal from '../modals/NewClientModal'
import { calculateVAT, calculateGrossAmount, calculateNetSum } from '../services/calculator';
import { saveInvoice, fetchBusinessDetails, fetchInvoiceDetails, handleSellerChange,handleErrorChange,handleProductChange,removeProduct,addProduct} from '../services/invoiceMethods';
import { validateForm } from '../services/validator'
import { useNavigate, useParams } from 'react-router-dom';
import {useInvoiceContext} from '../services/context'

const CreateInvoice = () => {
  const { id } = useParams(); // Get the invoice ID from the URL
  const [formData, setFormData] = useState({
    saleDate: dayjs(),
    invoiceDate: dayjs(),
    dateOfPayment: dayjs(),
    sellerName: '',
    sellerAddress: '',
    sellerNip: '',
    buyerName: '',
    buyerAddress: '',
    buyerNIP: '',
    payment: 'bank_transfer', // Default payment method
    bankName: '',
    accountNumber: '',
    number: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([{ productName: '', quantity: 1, netAmount: 0, vatRate: '5%', vatAmount: 0, grossAmount: 0 }]);
  const [sellers, setSellers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false); 
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const navigate = useNavigate();
  const { markInvoiceAsAdded } = useInvoiceContext();
  
  const handleClientAdd = () => {
    setModalOpen(true); // Otwórz modal
  };
  const handleModalClose = () => {
    setModalOpen(false); // Zamknij modal
  };
  const handleClientSave = (newClient) => {
    setClients((prevClients) => [...prevClients, newClient]); 
    setFormData((prevData) => ({
      ...prevData,
      buyerName: newClient.name,
      buyerAddress: newClient.address,
      buyerNIP: newClient.nip,

    }));// Dodaj nowego klienta do listy
  };
  const handleClientChange = (value) => {
    const selectedBuyer = clients.find((buyer) => buyer.name === value);
    if(selectedBuyer){
      setFormData((prevData) => ({
        ...prevData,
        buyerName: value,
        buyerAddress: selectedBuyer.address,
        buyerNIP: selectedBuyer.nip,

      }));
      handleErrorChange('buyerName', setFormErrors);
    }
  }
  const handleSave = (draft, id) => {
    const validationErrors = validateForm(formData, products);
    if (Object.keys(validationErrors).length > 1)
      setFormErrors(validationErrors);
    else {
      saveInvoice(formData, products, draft, id);
      markInvoiceAsAdded();
      navigate('/invoices')
    }
  }
  const handleChange = (e) =>{
    if(e.target.name==='bankName')
      setFormData({ ...formData, bankName: e.target.value })
    if(e.target.name==='accountNumber')
        setFormData({ ...formData, accountNumber: e.target.value })
    // Usuwanie błędu walidacji dla bankName
    handleErrorChange(e.target.name, setFormErrors);
  }
  useEffect(() => {
    if (id) {
      fetchInvoiceDetails(id, formData, setFormData, setProducts, setSellers, setClients, setSelectedBusinessId); // If there's an ID, fetch the invoice data
    } else {
      fetchBusinessDetails(formData.number, setSellers, setClients, setFormData, setSelectedBusinessId); // If no ID, proceed with the default behavior for creating a new invoice
    }
  }, [id]); // Depend on `id` to trigger fetching invoice data

  useEffect(() => {
    // Jeśli buyerName nie znajduje się na liście klientów, ustaw go ręcznie
    if (formData.buyerName && !clients.some(client => client.name === formData.buyerName)) {
      setClients(prevClients => [...prevClients, { name: formData.buyerName, address: formData.buyerAddress, nip: formData.buyerNIP }]);
    }
  }, [formData.buyerName, clients]);

  return (
<LocalizationProvider dateAdapter={AdapterDayjs}>  
  <Box sx={{display: 'flex', flexDirection: 'column', mt: 15, alignItems: 'center', '& > :not(style)': { m: 1, width: '100%', maxWidth: 800 }}}>
    <Paper elevation={3} sx={{ padding: '16px', textAlign: 'center', width: '100%' }}>
    <Typography variant="h6">Numer Faktury: {formData.number}</Typography>
      {/* Section for Dates */}
      <Box sx={{ marginTop: 2 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1, textAlign: 'center' }}>Terminy</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <DatePicker
                  label="Data Sprzedaży"
                  name="saleDate"
                  fullWidth
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1, marginRight: 1 }}
              />
              <DatePicker
                  label="Data Wystawienia"
                  name="issueDate"
                  fullWidth
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1,marginLeft: 1 }}
              />
          </Box>
      </Box>
        {/* Payment Section */}
    <Box sx={{ marginTop: 5 }}>
        <Typography>Płatność</Typography>

        {/* Payment Method and Payment Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Box sx={{ flex: 1, marginRight: 1 }}>
                <TextField
                    label="Sposób Płatności"
                    name="paymentMethod"
                    select
                    fullWidth
                    value={formData.payment}
                    onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                    margin="normal"
                    sx={{ marginRight: 1 }}
                >
                  <MenuItem value="bank_transfer">Przelew</MenuItem>
                  <MenuItem value="cash">Gotówka</MenuItem>
                </TextField>
            </Box>
            <DatePicker
                label="Data Płatności"
                name="paymentDate"
                fullWidth
                value={formData.dateOfPayment}
                onChange={(e) => setFormData({ ...formData, dateOfPayment: e })}
                margin="normal"
                sx={{ ml: 1, flex:1, mt:2 }}
                InputLabelProps={{ shrink: true }}
            />
        </Box>

            {   /* Bank Name and Account Number */}
            {formData.payment === 'bank_transfer' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, marginRight: 1 }}>
                <TextField
                    label="Nazwa Banku"
                    name="bankName"
                    fullWidth
                    value={formData.bankName}
                    onChange={(e) => handleChange(e)}
                    margin="normal"
                    disabled={formData.payment === 'cash'}
                    sx={{ flex: 1 }}
                    error={!!formErrors.bankName}
                    helperText={formErrors.bankName}
                />
            </Box>

            <Box sx={{ flex: 1, marginLeft: 1 }}>
                <TextField
                    label="Numer Konta"
                    name="accountNumber"
                    fullWidth
                    value={formData.accountNumber}
                    onChange={(e) => handleChange(e)}
                    margin="normal"
                    disabled={formData.payment === 'cash'}
                    sx={{ flex: 1 }}
                    error={!!formErrors.accountNumber}
                    helperText={formErrors.accountNumber}
                />
            </Box>
        </Box>
        )}
    </Box>


    {/* Section for Seller and Buyer (Client) */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <Box sx={{ flex: 1, marginRight: 1 }}>
        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Sprzedający</Typography>
              <TextField
                label="Nazwa Sprzedającego"
                name="sellerName"
                select
                fullWidth
                value={formData.sellerName}
                onChange={(e) => handleSellerChange(e.target.value, sellers, setSelectedBusinessId, setClients, setFormData)}
                margin="normal"
                sx={{ marginRight: 1 }}
              >
                {sellers.map((seller, index) => (
                  <MenuItem key={index} value={seller.companyName}>
                    {seller.companyName}
                  </MenuItem>
                ))}
              </TextField>
        </Box>
        <Box sx={{ flex: 1, marginLeft: 1 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Klient</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="Wybierz klienta"
                name="buyerName"
                select
                margin="normal"
                fullWidth
                value={formData.buyerName}
                onChange={(e) => handleClientChange(e.target.value)}
                error={!!formErrors.buyerName}
                helperText={formErrors.buyerName}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.name}>
                    {client.name}
                  </MenuItem>
                ))}
              </TextField>
            <IconButton onClick={handleClientAdd} color="primary" sx={{ marginLeft: 1 }}>
              <AddIcon />
            </IconButton>
          </Box>
          {/* Renderuj modal */}
          <NewClientModal open={isModalOpen} onClose={handleModalClose} onSave={handleClientSave}  businessId={selectedBusinessId} />
        </Box>
      </Box>

    {/* Section for Products */}
    {/* Sekcja produktów */}
    <Box>
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Produkty</Typography>
      {products.map((product, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          {/* Pierwszy wiersz */}
          <Grid container spacing={1} justifyContent="flex-end">
            <Grid item xs={10.5}>
              <TextField
                label="Nazwa Produktu"
                name="productName"
                fullWidth
                value={product.productName}
                onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                margin="normal"
                error={!!formErrors[`productName_${index}`]}
                helperText={formErrors[`productName_${index}`]}
              />
            </Grid>
            {/* Ilość */}
            <Grid item xs={1.5}>
              <TextField
                label="Ilość"
                name="quantity"
                type="number"
                fullWidth
                value={product.quantity}
                onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                margin="normal"
                error={!!formErrors[`quantity_${index}`]}
                helperText={formErrors[`quantity_${index}`]}
              />
            </Grid>
          </Grid>
            {/* Drugi wiersz */}
          <Grid container spacing={1} justifyContent="flex-end">
              {/* Ikona usuwania - pokazuje się tylko dla dodatkowych produktów */}
              {index > 0 && (
                <Grid item xs={1} container justifyContent="flex-start">
                  <IconButton onClick={() => removeProduct(index, products, setProducts)} color="secondary">
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              )}
            {/* Stawka VAT */}
            <Grid item xs={1.3} >
              <TextField
                label="VAT"
                name="vatRate"
                select
                fullWidth
                value={product.vatRate}
                onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                margin="normal"
              >
                <MenuItem value="5%">5%</MenuItem>
                <MenuItem value="10%">10%</MenuItem>
                <MenuItem value="23%">23%</MenuItem>
              </TextField>
            </Grid>
            {/* Cena Netto */}
            <Grid item xs={1.7}>
              <TextField
                label="Cena Netto"
                name="netAmount"
                type="number"
                fullWidth
                value={product.netAmount}
                onChange={(e) => handleProductChange(index, e, setProducts, products, setFormErrors)}
                margin="normal"
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
                error={!!formErrors[`netAmount_${index}`]}
                helperText={formErrors[`netAmount_${index}`]}
              />
            </Grid>

              {/* Formularz dla każdego produktu */}
              <Grid item xs={2}>
                <TextField
                  label="Wartość Netto"
                  name="netSum"
                  type="number"
                  fullWidth
                  value={calculateNetSum(product.netAmount, product.quantity)}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Kwota VAT"
                  name="vatAmount"
                  type="number"
                  fullWidth
                  value={calculateVAT(product.netAmount, product.vatRate, product.quantity)}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Kwota Brutto"
                  name="grossAmount"
                  type="number"
                  fullWidth
                  value={calculateGrossAmount(product.netAmount, product.vatAmount, product.quantity)}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
      </Box>
      ))}

        {/* Button to Add New Product */}
        <IconButton onClick={() =>addProduct(products, setProducts)} color="primary" sx={{ marginTop: 2 }}>
          <AddIcon />
        </IconButton>
      </Box>
      {/* Buttons for Save and Save as Draft */}
      <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" color="primary" onClick={() => handleSave(true, id)}>
          Zapisz Szkic
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleSave(false, id)}>
          Zapisz
        </Button>
      </Box>
    </Paper>
  </Box>
</LocalizationProvider> 
  );
};

export default CreateInvoice;
