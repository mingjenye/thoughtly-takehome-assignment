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
   * 
   * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
   * 
   * CURRENT: userId is manually provided in request body
   *   - User enters their ID in the frontend form
   *   - Backend trusts the userId without verification
   *   - Security Risk: Anyone can impersonate any user
   * 
   * TODO: Should use JWT authentication instead
   *   - Add authenticateToken middleware to this route
   *   - Extract userId from JWT token (req.user.userId)
   *   - Remove userId from request body
   * 
   * Example Code:
   *   // In routes: router.post('/reserve', authenticateToken, bookingController.reserveTickets);
   *   // In controller: const userId = req.user!.userId;  // From JWT, not req.body
   *   // Frontend: Include "Authorization: Bearer <token>" header
   */
  reserveTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Replace with: const userId = req.user!.userId;
      // Current implementation accepts userId from request body (NOT SECURE)
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
   * 
   * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
   * Same security concerns as reserveTickets - see notes above.
   * 
   * TODO: Extract userId from JWT token instead of request body
   *   const userId = req.user!.userId;
   */
  confirmBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Replace with: const userId = req.user!.userId;
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
   * 
   * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
   * 
   * CURRENT: Anyone can view any user's bookings by knowing their userId
   * TODO: Should verify that req.user.userId === req.params.userId
   *   - Prevents users from viewing other users' bookings
   *   - Or allow only if user has 'admin' role
   * 
   * Example:
   *   if (req.user!.userId !== parseInt(req.params.userId) && req.user!.role !== 'admin') {
   *     throw new ForbiddenError('Cannot view other users bookings');
   *   }
   */
  getUserBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      // TODO (Production): Add authorization check to verify user can access this data

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


