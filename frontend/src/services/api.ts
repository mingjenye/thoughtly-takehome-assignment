import axios, { AxiosInstance } from 'axios';
import {
  AvailableTicketsResponse,
  BookingRequest,
  ConfirmBookingRequest,
  CreateTicketsRequest,
  User,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Tickets endpoints
export const ticketsAPI = {
  /**
   * Get all available tickets
   */
  getAvailable: (eventId: number = 1) =>
    api.get<{ success: boolean; data: AvailableTicketsResponse }>('/tickets', {
      params: { eventId },
    }),

  /**
   * Create tickets (admin function)
   */
  createTickets: (data: CreateTicketsRequest) =>
    api.post('/tickets/create', data),

  /**
   * Get ticket by ID
   */
  getById: (id: number) => api.get(`/tickets/${id}`),
};

// Booking endpoints
export const bookingAPI = {
  /**
   * Reserve tickets (step 1)
   */
  reserve: (data: BookingRequest) => api.post('/booking/reserve', data),

  /**
   * Confirm booking (step 2)
   */
  confirm: (data: ConfirmBookingRequest) => api.post('/booking/confirm', data),

  /**
   * Get user bookings
   */
  getUserBookings: (userId: number) => api.get(`/booking/user/${userId}`),
};

// Users endpoints
export const usersAPI = {
  /**
   * Get all users
   */
  getAll: () => api.get<{ success: boolean; data: User[] }>('/users'),

  /**
   * Get user by ID
   */
  getById: (id: number) => api.get<{ success: boolean; data: User }>(`/users/${id}`),

  /**
   * Create a new user
   */
  create: (data: { name: string }) => api.post('/users', data),
};

export default api;
