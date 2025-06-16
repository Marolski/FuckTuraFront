import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { accountAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    repeatPassword: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, username, password, repeatPassword } = registerData;

    if (password !== repeatPassword) {
      setSnackbar({
        open: true,
        message: 'Hasła nie są identyczne',
        severity: 'error',
      });
      return;
    }

    try {
      await accountAPI.register({ email, password, username });
      setSnackbar({
        open: true,
        message: 'Konto zostało utworzone pomyślnie.',
        severity: 'success',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.[0]?.description || 'Błąd podczas rejestracji',
        severity: 'error',
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Card
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={registerData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nazwa użytkownika"
            name="username"
            value={registerData.username}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Hasło"
            name="password"
            type="password"
            value={registerData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Powtórz hasło"
            name="repeatPassword"
            type="password"
            value={registerData.repeatPassword}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Zarejestruj się
          </Button>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Masz już konto? <Link to="/login">Zaloguj się</Link>
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Snackbar z komunikatem sukcesu lub błędu */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;
