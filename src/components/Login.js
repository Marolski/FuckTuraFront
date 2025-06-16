import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';
import { useTheme } from '@mui/material/styles';
import { accountAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box'; // Dodano Box do responsywnego kontenera
import '../styles.css';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

const signIn = async (providers, formData, navigate) => {
  try {
    const username = formData.get('email');
    const password = formData.get('password');

    const loginData = { username, password };
    const response = await accountAPI.login(loginData);

    if (response.token != null) {
      const { userName } = response;
      console.log(`Zalogowano jako: ${userName}`);
      navigate('/home');
    }

  } catch (error) {
    console.error('Błąd logowania', error);
  }
};

export default function CredentialsSignInPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AppProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', // Zmienione z 'center'
          minHeight: '100vh',
          padding: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            padding: 3,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: '#fff',
            mt: 6, // Dodany margines od góry
          }}
        >

          <SignInPage
            slotProps={{
              emailField: {
                type: 'username',
                label: 'Nazwa użytkownika',
              },
              passwordField:{
                type: 'password',
                label: 'Hasło',
              }
            }}
            signIn={(provider, formData) => signIn(provider, formData, navigate)}
            providers={providers}
          />
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <p>
              Nie masz konta?{' '}
              <Link to="/register">Zarejestruj się</Link>
            </p>
          </Box>
        </Card>
      </Box>
    </AppProvider>
  );
}
