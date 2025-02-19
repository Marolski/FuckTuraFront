import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Modal, Toolbar, IconButton, Snackbar, Alert
} from '@mui/material';
import { businessAPI, userBusinessAPI } from '../services/api';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SellerSelectionModal from '../modals/SelectBusiness';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

function Businesses() {
  const [openSelectBusinessModal, setOpenSelectBusinessModal] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessData, setBusinessData] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchBusinesses = async () => {
    const response = await userBusinessAPI.get();
    setBusinesses(response);
  };

  const handleBusinessSelection = async (businessId) => {
    const selected = businesses.find(b => b.id === businessId);
    setSelectedBusiness(selected);
    setBusinessData(selected); // Załaduj dane firmy
    setOpenSelectBusinessModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessData({ ...businessData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      await businessAPI.update(selectedBusiness.id, businessData);
      setSnackbarMessage('Firma została zaktualizowana!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
        console.log(error)
      setSnackbarMessage('Błąd podczas zapisywania zmian.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  useEffect(() => {
    if (businesses.length > 0 && !selectedBusiness) {
      setOpenSelectBusinessModal(true); // Modal otworzy się tylko, jeśli nie ma wybranej firmy
    }
  }, [businesses, selectedBusiness]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
      <Typography variant="h4">Firmy</Typography>
      
      {/* Przycisk do wyboru firmy */}
        <SellerSelectionModal
            open={openSelectBusinessModal}
            sellers={businesses}
            onClose={() => setOpenSelectBusinessModal(false)}
            onSelectSeller={handleBusinessSelection}
        />

      {/* Formularz edycji firmy */}
      {selectedBusiness && (
        <Paper sx={{ padding: 3, width: '80%', maxWidth: 600, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edytuj dane firmy</Typography>
            <IconButton onClick={() => setOpenSelectBusinessModal(true)}>
                <SwapHorizIcon />
            </IconButton>
        </Box>
          <TextField
            label="Nazwa firmy"
            name="companyName"
            value={businessData.companyName || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="NIP"
            name="nipNumber"
            value={businessData.nipNumber || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Ulica"
            name="street"
            value={businessData.street || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Numer budynku"
            name="buildingNumber"
            value={businessData.buildingNumber || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Numer mieszkania"
            name="apartmentNumber"
            value={businessData.apartmentNumber || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Kod pocztowy"
            name="postalCode"
            value={businessData.postalCode || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Miasto"
            name="city"
            value={businessData.city || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Kraj"
            name="country"
            value={businessData.country || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={businessData.email || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Telefon"
            name="phoneNumber"
            value={businessData.phoneNumber || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="REGON"
            name="regon"
            value={businessData.regon || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Strona WWW"
            name="website"
            value={businessData.website || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Forma prawna"
            name="legalForm"
            value={businessData.legalForm || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Uwagi"
            name="notes"
            value={businessData.notes || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mt: 2 }}>
            Zapisz zmiany
          </Button>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Businesses;
