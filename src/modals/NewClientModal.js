import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Modal, Paper } from '@mui/material';
import { customerBusinessAPI } from '../services/api';  // Zaimportuj API

const NewClientModal = ({ open, onClose, onSave, businessId }) => {
  const [clientData, setClientData] = useState({
    name: '',
    address: '',
    nip: ''
  });

  const [loading, setLoading] = useState(false);  // Zmienna stanu do śledzenia, czy zapis jest w toku
  const [error, setError] = useState(null);       // Zmienna stanu do przechowywania błędów

  // Funkcja resetująca formularz
  const resetForm = () => {
    setClientData({
      name: '',
      address: '',
      nip: ''
    });
  };

  // Resetuj formularz po zamknięciu modala
  useEffect(() => {
    if (!open) {
      resetForm();
      setError(null);  // Wyczyść błędy po zamknięciu modala
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Funkcja do obsługi zapisu klienta
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Wywołanie API do zapisania klienta
      console.log(businessId)
      await customerBusinessAPI.createCustomer(businessId, clientData);
      onSave(clientData);    // Powiadomienie nadrzędnego komponentu o sukcesie
      resetForm();           // Resetuj formularz po zapisaniu
      onClose();             // Zamknij modal po zapisaniu
    } catch (err) {
      setError('Nie udało się zapisać klienta. Spróbuj ponownie.');  // Ustaw komunikat o błędzie
    } finally {
      setLoading(false);     // Ustaw zakończenie stanu ładowania
    }
  };

  const handleCancel = () => {
    resetForm(); // Zresetuj formularz, ale nie zapisuj
    onClose();   // Zamknij modal po kliknięciu "Anuluj"
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper elevation={3} sx={{ padding: 3, width: 400 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>Utwórz klienta</Typography>
          
          {error && <Typography color="error" sx={{ marginBottom: 2 }}>{error}</Typography>}
          
          <TextField
            label="Nazwa klienta"
            name="name"
            fullWidth
            margin="normal"
            value={clientData.name}
            onChange={handleChange}
            disabled={loading}  // Zablokuj pola podczas zapisu
          />
          <TextField
            label="Adres"
            name="address"
            fullWidth
            margin="normal"
            value={clientData.address}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            label="NIP"
            name="nip"
            fullWidth
            margin="normal"
            value={clientData.nip}
            onChange={handleChange}
            disabled={loading}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={loading}>
              Anuluj
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz klienta'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default NewClientModal;
