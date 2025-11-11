import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';

export class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  /**
   * Create tickets for an event (Admin function)
   * POST /api/v1/tickets/create
   */
  createTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId, vipCount, frontRowCount, gaCount } = req.body;

      const result = await this.ticketService.createTickets({
        eventId: eventId || 1, // Default to event 1
        vipCount: vipCount || 0,
        frontRowCount: frontRowCount || 0,
        gaCount: gaCount || 0,
      });

      res.status(201).json({
        success: true,
        message: 'Tickets created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all available tickets
   * GET /api/v1/tickets?eventId=1
   */
  getAvailableTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = parseInt(req.query.eventId as string) || 1; // Default to event 1

      const result = await this.ticketService.getAvailableTickets(eventId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get ticket by ID
   * GET /api/v1/tickets/:id
   */
  getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);

      const ticket = await this.ticketService.getTicketById(ticketId);

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };
}


