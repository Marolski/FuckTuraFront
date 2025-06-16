import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import NavBar from './components/NavBar';
import './styles.css'; // Importuj plik CSS
import MainPage from './components/MainPage'
import Invoices from './components/Invoices'
import InvoiceView from './components/InvoiceView'
import CreateInvoice from './components/CreateInvoice'
import Clients from './components/Clients';
import Businesses from './components/Bussinesses';
import HomePage from './components/HomePage';
import { InvoiceProvider } from './services/context';

const AppWithNavBar = () => {
  const location = useLocation(); // Hook do pobierania aktualnej trasy

  // Sprawdzamy, czy jesteśmy na trasie logowania lub rejestracji
  const hideNavBar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <>
      {/* Renderuj NavBar tylko, gdy nie jesteś na stronach logowania lub rejestracji */}
      {!hideNavBar && <NavBar />}
      <Routes>
        {/* Trasy bez NavBar */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Trasy z NavBar */}
        <Route path="/createInvoice" element={<CreateInvoice />} />
        <Route path="/createInvoice/:id" element={<CreateInvoice />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/Invoice/:id" element={<InvoiceView />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/bussiness" element={<Businesses />} />

        {/* Domyślna trasa */}
        <Route path="/login" element={<h1>Witamy w aplikacji!</h1>} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <InvoiceProvider>
      <Router>
        <AppWithNavBar/>
      </Router>
    </InvoiceProvider>
  );
};

export default App;
