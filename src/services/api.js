import axios from 'axios';

const API_BASE_URL = 'http://localhost:5074'; // Zmień na właściwy URL swojego API

// Tworzymy instancję Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do dodawania tokena do nagłówków
api.interceptors.request.use(
  (config) => {
    // Nie musisz tutaj dodawać nagłówka Authorization, jeśli token jest w http-only cookie
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Account API
export const accountAPI = {
  login: async (loginData) => {
    try {
      const response = await api.post('/api/account/login', loginData);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (registerData) => {
    try {
      const response = await api.post('/api/account/register', registerData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
};

// Invoice API
export const invoiceAPI = {
  getById: async (id) => {
    try {
      const response = await api.get(`/api/invoice/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      throw error;
    }
  },
  updateById: async (id, updateData) => {
    try {
      const response = await api.put(`/api/invoice/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update invoice by ID error:', error);
      throw error;
    }
  },
  deleteById: async (id) => {
    try {
      const response = await api.delete(`/api/invoice/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete invoice by ID error:', error);
      throw error;
    }
  },
  getByNumber: async (number) => {
    try {
      const response = await api.get('/api/invoice/GetByNumber', {
        params: { number },
      });
      return response.data;
    } catch (error) {
      console.error('Get invoice by number error:', error);
      throw error;
    }
  },
  getByNIP: async (NIP, isBusiness) => {
    try {
      const response = await api.get(`/api/invoice/${NIP}`, {
        params: { isBusiness },
      });
      return response.data;
    } catch (error) {
      console.error('Get invoice by NIP error:', error);
      throw error;
    }
  },
  create: async (invoiceData) => {
    try {
      const response = await api.post('/api/invoice', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Create invoice error:', error);
      throw error;
    }
  },
};

// Business API
export const businessAPI = {
  get: async () => {
    try {
      const response = await api.get('/api/business');
      return response.data;
    } catch (error) {
      console.error('Get business error:', error);
      throw error;
    }
  },
  create: async (businessData) => {
    try {
      const response = await api.post('/api/business', businessData);
      return response.data;
    } catch (error) {
      console.error('Create business error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/api/business/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get business by ID error:', error);
      throw error;
    }
  },
  update: async (id, businessData) => {
    try {
      const response = await api.put(`/api/business/${id}`, businessData);
      return response.data;
    } catch (error) {
      console.error('Update business error:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/business/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete business error:', error);
      throw error;
    }
  },
};

// Customer API
export const customerAPI = {
  get: async () => {
    try {
      const response = await api.get('/api/customer');
      return response.data;
    } catch (error) {
      console.error('Get customer error:', error);
      throw error;
    }
  },
  create: async (customerData) => {
    try {
      const response = await api.post('/api/customer', customerData);
      return response.data;
    } catch (error) {
      console.error('Create customer error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/api/customer/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get customer by ID error:', error);
      throw error;
    }
  },
  update: async (id, customerData) => {
    try {
      const response = await api.put(`/api/customer/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/customer/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete customer error:', error);
      throw error;
    }
  },
};

// CustomerBusiness API
export const customerBusinessAPI = {
  getByBusinessId: async (businessId) => {
    try {
      const response = await api.get(`/api/customerBusiness/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Get customerBusiness by business ID error:', error);
      throw error;
    }
  },
  createCustomer: async (businessId, customerData) => {
    try {
      const response = await api.post(`/api/customerBusiness/${businessId}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Create customer business error:', error);
      throw error;
    }
  }
};

// UserBusiness API
export const userBusinessAPI = {
  get: async () => {
    try {
      const response = await api.get('/api/userBusiness');
      return response.data;
    } catch (error) {
      console.error('Get user business error:', error);
      throw error;
    }
  },
  create: async (userBusinessData) => {
    try {
      const response = await api.post('/api/userBusiness', userBusinessData);
      return response.data;
    } catch (error) {
      console.error('Create user business error:', error);
      throw error;
    }
  }
};
