import { TicketRepository, TicketTier } from '../repositories/ticket.repository';
import { EventRepository } from '../repositories/event.repository';
import { UserRepository } from '../repositories/user.repository';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler';
import pool from '../config/database';

export class BookingService {
  private ticketRepository: TicketRepository;
  private eventRepository: EventRepository;
  private userRepository: UserRepository;

  constructor() {
    this.ticketRepository = new TicketRepository();
    this.eventRepository = new EventRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Reserve tickets for a user
   * This implements the first step of the booking process
   * Uses database transactions and row-level locking to prevent double-booking
   * 
   * Race Condition Prevention:
   * - Uses SELECT...FOR UPDATE SKIP LOCKED to lock specific ticket rows
   * - Only one transaction can lock a ticket at a time
   * - SKIP LOCKED ensures concurrent requests get different tickets
   * - Transaction ensures atomicity of the reservation
   */
  async reserveTickets(data: {
    userId: number;
    eventId: number;
    tickets: { tier: TicketTier; quantity: number }[];
  }) {
    const { userId, eventId, tickets } = data;

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const client = await pool.connect();
    const reservedTickets: any[] = [];

    try {
      // Begin transaction - critical for preventing double-booking
      await client.query('BEGIN');

      // Lock the event row to prevent race conditions on available count updates
      await this.eventRepository.findByIdForUpdate(eventId, client);

      // Reserve tickets for each tier
      for (const ticketRequest of tickets) {
        const { tier, quantity } = ticketRequest;

        // Check available count
        const availableCount = await this.ticketRepository.getAvailableCountByTier(
          eventId,
          tier
        );

        if (availableCount < quantity) {
          throw new BadRequestError(
            `Insufficient tickets available for ${tier}. Available: ${availableCount}, Requested: ${quantity}`
          );
        }

        // Reserve tickets one by one
        // Each call uses FOR UPDATE SKIP LOCKED to prevent race conditions
        for (let i = 0; i < quantity; i++) {
          const ticket = await this.ticketRepository.reserveTicket(
            eventId,
            tier,
            userId,
            client
          );

          if (!ticket) {
            throw new BadRequestError(
              `Failed to reserve ticket for ${tier}. Ticket may have been booked by another user.`
            );
          }

          reservedTickets.push(ticket);
        }
      }

      // Update event available counts (decrement)
      // BUG: Didn't handle the case if any of the tickets are not reserved successfully
      const vipCount = tickets.find(t => t.tier === 'VIP')?.quantity || 0;
      const frontRowCount = tickets.find(t => t.tier === 'Front Row')?.quantity || 0;
      const gaCount = tickets.find(t => t.tier === 'GA')?.quantity || 0;

      await this.eventRepository.updateAvailableTickets(
        eventId,
        -vipCount,
        -frontRowCount,
        -gaCount,
        client
      );

      // Commit transaction - all reservations are successful
      await client.query('COMMIT');

      return {
        success: true,
        reservedTickets,
        message: 'Tickets reserved successfully. Please confirm your booking.',
      };
    } catch (error) {
      // Rollback on any error - ensures data consistency
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Confirm booking and simulate payment
   * This is the second step where user confirms and pays
   * 
   * In a real system, this would:
   * 1. Call payment gateway (e.g., Stripe)
   * 2. Wait for payment confirmation
   * 3. Update ticket status based on payment result
   */
  async confirmBooking(data: {
    userId: number;
    ticketIds: number[];
    paymentSimulation?: 'success' | 'fail'; // For testing
  }) {
    const { userId, ticketIds, paymentSimulation = 'success' } = data;

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify all tickets are in pending status and belong to this user
      const tickets = [];
      for (const ticketId of ticketIds) {
        const ticket = await this.ticketRepository.findByIdForUpdate(ticketId, client);
        
        if (!ticket) {
          throw new NotFoundError(`Ticket ${ticketId} not found`);
        }

        if (ticket.user_id !== userId) {
          throw new BadRequestError(`Ticket ${ticketId} does not belong to this user`);
        }

        if (ticket.status !== 'pending') {
          throw new BadRequestError(
            `Ticket ${ticketId} is not in pending status. Current status: ${ticket.status}`
          );
        }

        tickets.push(ticket);
      }

      // Simulate payment processing
      // In production, this would call external payment API
      const paymentSuccess = await this.simulatePayment(paymentSimulation);

      if (!paymentSuccess) {
        // Payment failed - cancel reservations
        for (const ticketId of ticketIds) {
          await this.ticketRepository.cancelReservation(ticketId, client);
        }

        // Restore event available counts
        const vipCount = tickets.filter(t => t.tier === 'VIP').length;
        const frontRowCount = tickets.filter(t => t.tier === 'Front Row').length;
        const gaCount = tickets.filter(t => t.tier === 'GA').length;

        await this.eventRepository.updateAvailableTickets(
          tickets[0].event_id,
          vipCount,
          frontRowCount,
          gaCount,
          client
        );

        await client.query('COMMIT');

        return {
          success: false,
          message: 'Payment failed. Tickets have been released.',
        };
      }

      // Payment successful - confirm bookings
      const confirmedTickets = [];
      for (const ticketId of ticketIds) {
        const ticket = await this.ticketRepository.confirmBooking(ticketId, client);
        confirmedTickets.push(ticket);
      }

      // Update user's tickets array
      const userTickets = user.tickets || [];
      const newTicketIds = confirmedTickets.map(t => t.id.toString());
      await this.userRepository.updateTickets(userId, [...userTickets, ...newTicketIds]);

      await client.query('COMMIT');

      return {
        success: true,
        confirmedTickets,
        message: 'Booking confirmed successfully!',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Simulate payment processing
   * In production, replace with actual payment gateway integration
   */
  private async simulatePayment(result: 'success' | 'fail'): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return result === 'success';
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tickets = await this.ticketRepository.findByUserId(userId);

    return {
      userId,
      userName: user.name,
      tickets,
      totalTickets: tickets.length,
    };
  }
}

