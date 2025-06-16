import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleAction = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    document.title = 'Fakturowanie — Prosto. Online. Globalnie.';
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Wystawiaj faktury z dowolnego miejsca
        </Typography>

        <Typography variant="h6" sx={{ opacity: 0.9 }} mb={4}>
          Nowoczesna aplikacja do fakturowania online dla firm, freelancerów i zespołów.
          Zacznij już teraz i miej wszystko pod kontrolą.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          mb={4}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
          >
            Załóż konto
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => handleAction('/invoices/new')}
          >
            Wystaw fakturę
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          © {new Date().getFullYear()} TwojaFirma. Wszystkie prawa zastrzeżone.
        </Typography>
      </Container>
    </Box>
  );
};

export default HomePage;
