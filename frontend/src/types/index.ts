// User types
export interface User {
  id: number;
  name: string;
  tickets: string[];
  created_at: string;
}

// Ticket types
export type TicketTier = 'VIP' | 'Front Row' | 'GA';
export type TicketStatus = 'available' | 'pending' | 'booked';

export interface Ticket {
  id: number;
  event_id: number;
  tier: TicketTier;
  status: TicketStatus;
  user_id: number | null;
  booked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TierInfo {
  name: TicketTier;
  price: number;
  available: number;
  tickets: Ticket[];
}

export interface AvailableTicketsResponse {
  eventId: number;
  tiers: TierInfo[];
  totalAvailable: number;
}

// Booking types
export interface BookingRequest {
  userId: number;
  eventId?: number;
  tickets: { tier: TicketTier; quantity: number }[];
}

export interface ReservationResponse {
  success: boolean;
  reservedTickets: Ticket[];
  message: string;
}

export interface ConfirmBookingRequest {
  userId: number;
  ticketIds: number[];
  paymentSimulation?: 'success' | 'fail';
}

export interface ConfirmBookingResponse {
  success: boolean;
  confirmedTickets?: Ticket[];
  message: string;
}

// Create tickets types
export interface CreateTicketsRequest {
  eventId?: number;
  vipCount: number;
  frontRowCount: number;
  gaCount: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    status: number;
    stack?: string;
  };
}
