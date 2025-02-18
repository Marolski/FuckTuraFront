import React, { useEffect, useState } from 'react';
import { AppProvider } from '@toolpad/core';
import { useTheme, TextField, Button, Card, Box, Avatar, Typography, Paper, ButtonBase } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Importujemy Link z react-router-dom


export default function MainPage() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Pobierz wartość username z localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    // preview-start
    <AppProvider theme={theme}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexWrap: 'wrap',
        '& > :not(style)': {
          m: 1,
          width: 256,
          height: 128,
          marginRight: '10px',
          marginLeft: '10px'
        },
        mt:15
      }}
    >
      <ButtonBase onClick={() => handleNavigation('/invoices')}>
          <Paper elevation={3} 
            sx={{ 
                minWidth: '100%',
                    padding: '16px', 
                    textAlign: 'center', 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark', // Zmiana koloru na hover
                    },
                
                }}>
            <Typography variant="h6">FAKTURY</Typography>
          </Paper>
        </ButtonBase>

        <ButtonBase onClick={() => handleNavigation('/clients')}>
          <Paper elevation={3} sx={{ 
                    minWidth: '100%',
                    padding: '16px', 
                    textAlign: 'center', 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark', // Zmiana koloru na hover
                    },
                
                }}>
            <Typography variant="h6">KLIENCI</Typography>
          </Paper>
        </ButtonBase>

        <ButtonBase onClick={() => handleNavigation('/home')} >
          <Paper elevation={3} sx={{ 
                    minWidth: '100%',
                    padding: '16px', 
                    textAlign: 'center', 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark', // Zmiana koloru na hover
                    },
                
                }}>
            <Typography variant="h6">FIRMY</Typography>
          </Paper>
        </ButtonBase>
    </Box>
    </AppProvider>
    // preview-end
  );
}
