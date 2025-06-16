import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Modal, Paper, Fade } from '@mui/material';
import { customerAPI, customerBusinessAPI } from '../services/api';
import { validateClientForm } from '../services/validator';

const NewClientModal = ({ open, onClose, onSave, businessId, clientToEdit }) => {
  const [clientData, setClientData] = useState({
    name: '',
    address: '',
    nip: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setClientData({
      name: '',
      address: '',
      nip: ''
    });
  };

  useEffect(() => {
    if (clientToEdit && clientToEdit.id) {
      setClientData(clientToEdit);
    } else {
      resetForm();
    }
  }, [clientToEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });

    setClientData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const validationErrors = validateClientForm(clientData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (clientToEdit && clientToEdit.id) {
        await customerAPI.update(clientToEdit.id, clientData);
        onSave(clientData, 'Dane klienta zostały zaktualizowane.');
      } else {
        await customerBusinessAPI.createCustomer(businessId, clientData);
        onSave(clientData, 'Klient został dodany pomyślnie.');
      }
      resetForm();
      onClose();
    } catch (err) {
      setErrors({ general: 'Nie udało się zapisać klienta. Spróbuj ponownie.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 400, mx: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              {clientToEdit ? 'Edytuj klienta' : 'Utwórz klienta'}
            </Typography>

            {errors.general && <Typography color="error" sx={{ marginBottom: 2 }}>{errors.general}</Typography>}

            <TextField
              label="Nazwa klienta"
              name="name"
              fullWidth
              margin="normal"
              value={clientData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
            <TextField
              label="Adres"
              name="address"
              fullWidth
              margin="normal"
              value={clientData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              disabled={loading}
            />
            <TextField
              label="NIP"
              name="nip"
              fullWidth
              margin="normal"
              value={clientData.nip}
              onChange={handleChange}
              error={!!errors.nip}
              helperText={errors.nip}
              disabled={loading}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={loading}>
                Anuluj
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Zapisywanie...' : clientToEdit ? 'Zapisz zmiany' : 'Zapisz klienta'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Modal>
  );
};

export default NewClientModal;
