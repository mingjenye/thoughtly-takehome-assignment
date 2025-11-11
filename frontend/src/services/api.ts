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

/**
 * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
 * 
 * CURRENT: No authentication, no JWT token in requests
 *   - Users manually enter userId in the frontend form
 *   - userId sent in request body without verification
 * 
 * TODO: Add request interceptor to include JWT token
 * 
 * Example Implementation:
 * 
 * // Request interceptor - Add JWT token to all requests
 * api.interceptors.request.use(
 *   (config) => {
 *     // Get token from localStorage (or more secure storage)
 *     const token = localStorage.getItem('authToken');
 *     
 *     if (token) {
 *       // Add Authorization header with Bearer token
 *       config.headers.Authorization = `Bearer ${token}`;
 *     }
 *     
 *     return config;
 *   },
 *   (error) => {
 *     return Promise.reject(error);
 *   }
 * );
 * 
 * After login, store the token:
 *   const response = await authAPI.login(email, password);
 *   localStorage.setItem('authToken', response.data.token);
 * 
 * On logout, clear the token:
 *   localStorage.removeItem('authToken');
 * 
 * Security Note: 
 *   - localStorage is vulnerable to XSS attacks
 *   - For production, consider using httpOnly cookies instead
 *   - Implement token refresh mechanism for better security
 */

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // TODO: Handle 401 Unauthorized errors
    // if (error.response?.status === 401) {
    //   // Token expired or invalid
    //   localStorage.removeItem('authToken');
    //   window.location.href = '/login';
    // }
    
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
   * 
   * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
   * CURRENT: BookingRequest includes userId in body
   * TODO: Remove userId from body, backend extracts it from JWT token
   * 
   * Updated interface would be:
   *   interface BookingRequest {
   *     // userId: number;  ← REMOVE THIS
   *     eventId: number;
   *     tickets: { tier: TicketTier; quantity: number }[];
   *   }
   */
  reserve: (data: BookingRequest) => api.post('/booking/reserve', data),

  /**
   * Confirm booking (step 2)
   * 
   * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
   * CURRENT: ConfirmBookingRequest includes userId in body
   * TODO: Remove userId from body, backend extracts it from JWT token
   */
  confirm: (data: ConfirmBookingRequest) => api.post('/booking/confirm', data),

  /**
   * Get user bookings
   * 
   * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
   * CURRENT: Anyone can fetch any user's bookings
   * TODO: Backend should verify JWT token matches the requested userId
   *   - Or remove userId parameter and always fetch req.user.userId from token
   *   - getUserBookings: () => api.get('/booking/my-bookings')
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
