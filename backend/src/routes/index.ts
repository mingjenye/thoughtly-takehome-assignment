import { Router } from 'express';
import ticketRoutes from './ticket.routes';
import bookingRoutes from './booking.routes';
import userRoutes from './user.routes';

const router = Router();

// API Routes
router.use('/tickets', ticketRoutes);
router.use('/booking', bookingRoutes);
router.use('/users', userRoutes);

// Base API info
router.get('/', (_req, res) => {
  res.json({
    message: 'Concert Ticket Booking API',
    version: '1.0.0',
    endpoints: {
      tickets: '/api/v1/tickets',
      booking: '/api/v1/booking',
      users: '/api/v1/users',
    },
  });
});

export default router;
