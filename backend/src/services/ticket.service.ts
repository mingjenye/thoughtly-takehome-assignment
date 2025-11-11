import { TicketRepository, CreateTicketData } from '../repositories/ticket.repository';
import { EventRepository } from '../repositories/event.repository';
import { NotFoundError } from '../middleware/errorHandler';
import pool from '../config/database';

export class TicketService {
  private ticketRepository: TicketRepository;
  private eventRepository: EventRepository;

  constructor() {
    this.ticketRepository = new TicketRepository();
    this.eventRepository = new EventRepository();
  }

  /**
   * Create tickets for an event
   * This is the admin/setup function to populate tickets
   */
  async createTickets(data: {
    eventId: number;
    vipCount: number;
    frontRowCount: number;
    gaCount: number;
  }) {
    const { eventId, vipCount, frontRowCount, gaCount } = data;

    // Validate event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const ticketsToCreate: CreateTicketData[] = [];

      // Create VIP tickets
      for (let i = 0; i < vipCount; i++) {
        ticketsToCreate.push({ event_id: eventId, tier: 'VIP' });
      }

      // Create Front Row tickets
      for (let i = 0; i < frontRowCount; i++) {
        ticketsToCreate.push({ event_id: eventId, tier: 'Front Row' });
      }

      // Create GA tickets
      for (let i = 0; i < gaCount; i++) {
        ticketsToCreate.push({ event_id: eventId, tier: 'GA' });
      }

      // Bulk create tickets
      const tickets = await this.ticketRepository.createBulk(ticketsToCreate);

      // Update event available counts
      await this.eventRepository.updateAvailableTickets(
        eventId,
        vipCount,
        frontRowCount,
        gaCount,
        client
      );

      await client.query('COMMIT');

      return {
        created: tickets.length,
        breakdown: {
          vip: vipCount,
          frontRow: frontRowCount,
          ga: gaCount,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all available tickets for an event
   * Returns tickets grouped by tier with pricing information
   */
  async getAvailableTickets(eventId: number) {
    const tickets = await this.ticketRepository.findAvailableByEvent(eventId);

    // Group tickets by tier
    const ticketsByTier = {
      VIP: tickets.filter(t => t.tier === 'VIP'),
      'Front Row': tickets.filter(t => t.tier === 'Front Row'),
      GA: tickets.filter(t => t.tier === 'GA'),
    };

    // Pricing information
    const pricing = {
      VIP: 100,
      'Front Row': 50,
      GA: 10,
    };

    return {
      eventId,
      tiers: [
        {
          name: 'VIP',
          price: pricing.VIP,
          available: ticketsByTier.VIP.length,
          tickets: ticketsByTier.VIP,
        },
        {
          name: 'Front Row',
          price: pricing['Front Row'],
          available: ticketsByTier['Front Row'].length,
          tickets: ticketsByTier['Front Row'],
        },
        {
          name: 'GA',
          price: pricing.GA,
          available: ticketsByTier.GA.length,
          tickets: ticketsByTier.GA,
        },
      ],
      totalAvailable: tickets.length,
    };
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: number) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }
    return ticket;
  }
}

