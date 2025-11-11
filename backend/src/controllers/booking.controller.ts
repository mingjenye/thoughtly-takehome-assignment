import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { TicketTier } from '../repositories/ticket.repository';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  /**
   * Reserve tickets
   * POST /api/v1/booking/reserve
   * Body: { userId, eventId, tickets: [{ tier, quantity }] }
   */
  reserveTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, eventId, tickets } = req.body;

      const result = await this.bookingService.reserveTickets({
        userId: parseInt(userId),
        eventId: eventId || 1, // Default to event 1
        tickets: tickets.map((t: any) => ({
          tier: t.tier as TicketTier,
          quantity: parseInt(t.quantity),
        })),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Confirm booking (after payment)
   * POST /api/v1/booking/confirm
   * Body: { userId, ticketIds, paymentSimulation }
   */
  confirmBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, ticketIds, paymentSimulation } = req.body;

      const result = await this.bookingService.confirmBooking({
        userId: parseInt(userId),
        ticketIds: ticketIds.map((id: any) => parseInt(id)),
        paymentSimulation: paymentSimulation || 'success',
      });

      res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user bookings
   * GET /api/v1/booking/user/:userId
   */
  getUserBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);

      const result = await this.bookingService.getUserBookings(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}


