import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

const router = Router();
const bookingController = new BookingController();

/**
 * @route   POST /api/v1/booking/reserve
 * @desc    Reserve tickets (step 1 of booking process)
 * @access  Public
 * @body    { userId, eventId?, tickets: [{ tier, quantity }] }
 */
router.post('/reserve', bookingController.reserveTickets);

/**
 * @route   POST /api/v1/booking/confirm
 * @desc    Confirm booking after payment (step 2 of booking process)
 * @access  Public
 * @body    { userId, ticketIds, paymentSimulation? }
 */
router.post('/confirm', bookingController.confirmBooking);

/**
 * @route   GET /api/v1/booking/user/:userId
 * @desc    Get user's bookings
 * @access  Public
 */
router.get('/user/:userId', bookingController.getUserBookings);

export default router;

