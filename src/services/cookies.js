import Cookies from 'js-cookie';

export const getValueFromCookies = (valueName) => {
    // 1. Pobierz ciastko
    return Cookies.get(valueName); // Dostosuj nazwę ciasteczka do swojej aplikacji
  }