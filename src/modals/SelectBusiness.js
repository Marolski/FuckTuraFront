import React, { useState } from 'react';
import { Modal, Box, Button, Typography,Grid  } from '@mui/material';

function SellerSelectionModal({ open, sellers, onClose, onSelectSeller }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectSeller = (id) => {
    setSelectedId(id);
    onSelectSeller(id); // Wywołaj funkcję callback do rodzica z wybranym id
    onClose(); // Zamknij modal po wybraniu
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="seller-selection-modal"
      aria-describedby="modal-do wyboru firmy"
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
          width: '80%', // Ustawienie szerokości, by przyciski były szersze
          maxWidth: 600, // Maksymalna szerokość
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Wybierz firmę
        </Typography>
        {sellers.length === 0 ? (
          <Typography>Brak dostępnych firm.</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {sellers.map((seller) => (
              <Grid item xs={12} sm={6} md={4} key={seller.id}> {/* Ustalamy liczbę przycisków w rzędzie */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: 56 }} // Większe przyciski
                  onClick={() => handleSelectSeller(seller.id)}
                >
                  {seller.companyName}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Modal>
  );
}

export default SellerSelectionModal;
