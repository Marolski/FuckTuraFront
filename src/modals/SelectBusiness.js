import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Grid } from '@mui/material';

function SellerSelectionModal({ open, sellers, onClose, onSelectSeller, onAddNewSeller }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectSeller = (id) => {
    setSelectedId(id);
    onSelectSeller(id);
    onClose(); // zamyka modal tylko przy wyborze
  };

  const handleAddSeller = () => {
    onAddNewSeller();
    onClose(); // zamyka modal tylko przy dodawaniu
  };

  return (
    <Modal
      open={open}
      onClose={() => {}} // blokujemy zamknięcie kliknięciem poza modal
      disableEscapeKeyDown // blokujemy zamknięcie klawiszem Esc
      aria-labelledby="seller-selection-modal"
      aria-describedby="modal-do-wyboru-firmy"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '33%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '80%',
          maxWidth: 600,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Wybierz firmę
        </Typography>
        {sellers.length === 0 ? (
          <Typography sx={{ mb: 2 }}>Brak dostępnych firm.</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
            {sellers.map((seller) => (
              <Grid item xs={12} sm={6} md={4} key={seller.id}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: 56 }}
                  onClick={() => handleSelectSeller(seller.id)}
                >
                  {seller.companyName}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleAddSeller}
        >
          Dodaj firmę
        </Button>
      </Box>
    </Modal>
  );
}

export default SellerSelectionModal;
