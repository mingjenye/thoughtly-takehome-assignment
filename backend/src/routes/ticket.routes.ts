import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';

const router = Router();
const ticketController = new TicketController();

/**
 * @route   POST /api/v1/tickets/create
 * @desc    Create tickets for an event (Admin function)
 * @access  Public (in production, this should be protected)
 * @body    { eventId?, vipCount, frontRowCount, gaCount }
 */
router.post('/create', ticketController.createTickets);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all available tickets
 * @access  Public
 * @query   eventId (optional, defaults to 1)
 */
router.get('/', ticketController.getAvailableTickets);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get ticket by ID
 * @access  Public
 */
router.get('/:id', ticketController.getTicketById);

export default router;

