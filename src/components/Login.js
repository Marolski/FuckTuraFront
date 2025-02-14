import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';
import { useTheme } from '@mui/material/styles';
import { accountAPI } from '../services/api'; // Upewnij się, że ścieżka jest poprawna
import { Link, useNavigate  } from 'react-router-dom'; // Importujemy Link z react-router-dom
import Card from '@mui/material/Card';
import '../styles.css'; // Importuj plik CSS

// preview-start
const providers = [{ id: 'credentials', name: 'Email and Password' }];
// preview-end

const signIn = async (providers, formData, navigate) => {
  try {
    const username = formData.get('email'); // Zakładam, że używasz 'email' jako 'username'
    const password = formData.get('password');

    // Wysłanie danych do Twojego API logowania
    const loginData = { username, password };
    const response = await accountAPI.login(loginData);

    // Zalogowano pomyślnie
    if (response.token!=null) {
      // Serwer powinien ustawić http-only cookie z tokenem
      // Możesz opcjonalnie przechować inne dane, jeśli to konieczne, ale bezpieczne dane w localStorage.

      // Można również pobrać nazwę użytkownika z odpowiedzi lub w innym kroku
      const { userName } = response;
      console.log(`Zalogowano jako: ${userName}`);

      // Nawigacja do strony domowej po zalogowaniu
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
    // preview-start
    <AppProvider theme={theme}>
        <Card sx={{ minWidth: 275 }}>
            <SignInPage 
            slotProps={{
                emailField: {
                type: "username",
                label: "Username",
                }
            }}
            signIn={(provider, formData) => signIn(provider, formData, navigate)}
            providers={providers} />
                {/* Dodanie linku do strony rejestracji */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p>Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
            </div>
        </Card>
    </AppProvider>
    // preview-end
  );
}
