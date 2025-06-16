import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Toolbar, IconButton,
  Snackbar, Alert, FormControlLabel, Checkbox
} from '@mui/material';
import { businessAPI, userBusinessAPI } from '../services/api';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SellerSelectionModal from '../modals/SelectBusiness';
import { validateNewBusinessForm } from '../services/validator';
import { useInvoiceContext } from '../services/context';
import { useNavigate, useLocation } from 'react-router-dom';

function Businesses() {
  const [openSelectBusinessModal, setOpenSelectBusinessModal] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessData, setBusinessData] = useState({});
  const [isNewBusiness, setIsNewBusiness] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const location = useLocation();
  const addingNew = location.state?.addingNew;
  const navigate = useNavigate();
  const { markBusinessAsAdded } = useInvoiceContext();

  const fetchBusinesses = async () => {
    const response = await userBusinessAPI.get();
    setBusinesses(response);

    if (response.length === 0) {
      handleAddNewBusiness();
    }
  };

  const handleBusinessSelection = (businessId) => {
    const selected = businesses.find(b => b.id === businessId);
    setSelectedBusiness(selected);
    setBusinessData(selected);
    setIsNewBusiness(false);
    setFormErrors({});
    setOpenSelectBusinessModal(false);
  };

  const handleAddNewBusiness = () => {
    setSelectedBusiness(null);
    setBusinessData({
      companyName: '',
      nipNumber: '',
      street: '',
      buildingNumber: '',
      apartmentNumber: '',
      postalCode: '',
      city: '',
      country: '',
      email: '',
      phoneNumber: '',
      regon: '',
      website: '',
      legalForm: '',
      notes: '',
      accountNumber: '',
      bankName: '',
      sendReminderEmails: true,
    });
    setIsNewBusiness(true);
    setFormErrors({});
    setOpenSelectBusinessModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessData({ ...businessData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleCheckboxChange = (e) => {
    setBusinessData({ ...businessData, sendReminderEmails: e.target.checked });
  };

  const handleSaveChanges = async () => {
    console.log("aaaaa")
      const errors = validateNewBusinessForm(businessData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setSnackbarMessage('Uzupełnij wymagane pola!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    try {
      if (isNewBusiness) {
        await userBusinessAPI.create(businessData);
        await fetchBusinesses();
        setSnackbarMessage('Nowa firma została dodana!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        markBusinessAsAdded();
        setTimeout(() => {
          navigate('/Invoices');
        });
      } else {
        await businessAPI.update(selectedBusiness.id, businessData);
        await fetchBusinesses();
        setSnackbarMessage('Dane firmy zostały zaktualizowane!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Błąd podczas zapisywania.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  useEffect(() => {
    if (addingNew) {
      handleAddNewBusiness();
    } else if (businesses.length > 0 && !selectedBusiness) {
      setOpenSelectBusinessModal(true);
    }
  }, [businesses, selectedBusiness, addingNew]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fields = [
    { label: 'Nazwa firmy', name: 'companyName' },
    { label: 'NIP', name: 'nipNumber' },
    { label: 'Ulica', name: 'street' },
    { label: 'Numer budynku', name: 'buildingNumber' },
    { label: 'Numer mieszkania', name: 'apartmentNumber' },
    { label: 'Kod pocztowy', name: 'postalCode' },
    { label: 'Miasto', name: 'city' },
    { label: 'Kraj', name: 'country' },
    { label: 'Email', name: 'email' },
    { label: 'Telefon', name: 'phoneNumber' },
    { label: 'REGON', name: 'regon' },
    { label: 'Strona WWW', name: 'website' },
    { label: 'Forma prawna', name: 'legalForm' },
    { label: 'Numer konta', name: 'accountNumber' },
    { label: 'Nazwa banku', name: 'bankName' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Toolbar sx={{ mb: 2 }} />
      <Typography variant="h4">Dane Firmy</Typography>

      <SellerSelectionModal
        open={openSelectBusinessModal}
        sellers={businesses}
        onClose={() => setOpenSelectBusinessModal(false)}
        onSelectSeller={handleBusinessSelection}
        onAddNewSeller={handleAddNewBusiness}
      />

      {(selectedBusiness || isNewBusiness) && (
        <Paper sx={{ padding: 3, width: '80%', maxWidth: 600, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isNewBusiness ? 'Dodaj nową firmę' : 'Edytuj dane firmy'}
            </Typography>
            <IconButton onClick={() => setOpenSelectBusinessModal(true)}>
              <SwapHorizIcon />
            </IconButton>
          </Box>
          {fields.map(({ label, name, multiline, rows }) => (
            <TextField
              key={name}
              label={label}
              name={name}
              value={businessData[name] || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline={multiline}
              rows={rows}
              error={Boolean(formErrors[name])}
              helperText={formErrors[name]}
            />
          ))}

          <FormControlLabel
            control={
              <Checkbox
                checked={businessData.sendReminderEmails || false}
                onChange={handleCheckboxChange}
              />
            }
            label="Wysyłaj przypomnienie o fakturze pod koniec miesiąca"
            sx={{ mt: 1 }}
          />

          <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mt: 2 }}>
            {isNewBusiness ? 'Dodaj firmę' : 'Zapisz zmiany'}
          </Button>
        </Paper>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Businesses;
