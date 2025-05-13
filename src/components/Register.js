import React, { useState } from 'react';
import { AppProvider } from '@toolpad/core';
import { useTheme, TextField, Button, Card, Box, Avatar, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { accountAPI } from '../services/api'; // Upewnij się, że ścieżka jest poprawna
import { Link, useNavigate } from 'react-router-dom'; // Importujemy Link z react-router-dom
import '../styles.css'; // Importuj plik CSS

const RegisterPage = () => {
  const theme = useTheme();
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, repeatPassword, username } = registerData;
    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await accountAPI.register({ email, password, username });
      navigate('/login');
    } catch (error) {
      setError(error.response.data[0].description);
    }
  };

  return (
    <AppProvider theme={theme}>
      <Card sx={{ minWidth: 275, padding: '20px' }}>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ my: 1, mb: 2, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h5" color="textPrimary" gutterBottom textAlign="center">
          Sign up
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={registerData.email}
            onChange={handleChange}
            required
            margin="dense"
            slotProps={{
                htmlInput: {
                sx: { paddingTop: '12px', paddingBottom: '12px' },
                },
                inputLabel: {
                sx: { lineHeight: '1rem' },
                },
            }}
            fullWidth
          />
          <TextField
            label="Username"
            name="username"
            type="username"
            value={registerData.username}
            onChange={handleChange}
            margin="dense"
            required
            slotProps={{
              htmlInput: {
                sx: { paddingTop: '12px', paddingBottom: '12px' },
              },
              inputLabel: {
                sx: { lineHeight: '1rem' },
              },
            }}
            fullWidth
          />
          <TextField
            label="Hasło"
            name="password"
            type="password"
            value={registerData.password}
            onChange={handleChange}
            margin="dense"
            required
            slotProps={{
              htmlInput: {
                sx: { paddingTop: '12px', paddingBottom: '12px' },
              },
              inputLabel: {
                sx: { lineHeight: '1rem' },
              },
            }}
            fullWidth
          />
          <TextField
            label="Powtórz hasło"
            name="repeatPassword"
            type="password"
            value={registerData.repeatPassword}
            onChange={handleChange}
            margin="dense"
            required
            slotProps={{
              htmlInput: {
                sx: { paddingTop: '12px', paddingBottom: '12px' },
              },
              inputLabel: {
                sx: { lineHeight: '1rem' },
              },
            }}
            fullWidth
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
            <Button variant="contained" color="primary" type="submit">
              Zarejestruj się
            </Button>
          </Box>
        </form>
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
        </Box>
        </Box>
      </Card>
    </AppProvider>
  );
};

export default RegisterPage;
