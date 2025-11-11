import React, { useState, useEffect } from 'react';
import { ticketsAPI, bookingAPI } from '../services/api';
import { TierInfo, Ticket } from '../types';
import './TicketBookingPage.css';

/**
 * AUTHENTICATION LAYER IMPLEMENTATION NOTE:
 * 
 * CURRENT: Users manually enter their userId
 *   - userId stored in component state
 *   - No login/logout functionality
 *   - Anyone can impersonate any user
 * 
 * TODO: Implementation:
 *   1. Remove manual userId input field
 *   2. User must login first (redirect to /login if not authenticated)
 *   3. Store JWT token in localStorage after successful login
 *   4. Create AuthContext to manage authentication state globally
 *   5. Backend extracts userId from JWT token, not from request body
 * 
 * Example AuthContext usage:
 *   const { user, isAuthenticated } = useAuth();
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *   // Use user.id, user.name, user.email from context
 */
export const TicketBookingPage: React.FC = () => {
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // TODO: Remove this state, get user from AuthContext instead
  // Current: Manual userId input (NOT SECURE)
  const [userId, setUserId] = useState<string>('');
  
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({
    VIP: 0,
    'Front Row': 0,
    GA: 0,
  });
  const [reservedTickets, setReservedTickets] = useState<Ticket[]>([]);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm'>('select');
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAvailableTickets();
  }, []);

  const fetchAvailableTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getAvailable(1);
      setTiers(response.data.data.tiers);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (tier: string, quantity: number) => {
    const tierInfo = tiers.find(t => t.name === tier);
    if (!tierInfo) return;

    const maxQuantity = tierInfo.available;
    const validQuantity = Math.max(0, Math.min(quantity, maxQuantity));

    setSelectedTickets(prev => ({
      ...prev,
      [tier]: validQuantity,
    }));
  };

  const handleReserveTickets = async () => {
    // TODO: Remove this check, user will already be authenticated
    if (!userId) {
      setError('Please enter your User ID');
      return;
    }

    const ticketsToReserve = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([tier, quantity]) => ({ tier: tier as any, quantity }));

    if (ticketsToReserve.length === 0) {
      setError('Please select at least one ticket');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // TODO: Remove userId from request body
      // Backend will extract userId from JWT token automatically
      // Updated call: await bookingAPI.reserve({ eventId: 1, tickets: ticketsToReserve });
      const response = await bookingAPI.reserve({
        userId: parseInt(userId), // NOT SECURE: Remove this field
        eventId: 1,
        tickets: ticketsToReserve,
      });

      setReservedTickets(response.data.data.reservedTickets);
      setBookingStep('confirm');
      setBookingMessage(response.data.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reserve tickets');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBooking = async (paymentSuccess: boolean = true) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // TODO: Remove userId from request body
      // Backend will extract userId from JWT token automatically
      const response = await bookingAPI.confirm({
        userId: parseInt(userId), // NOT SECURE: Remove this field
        ticketIds: reservedTickets.map(t => t.id),
        paymentSimulation: paymentSuccess ? 'success' : 'fail',
      });

      if (response.data.data.success) {
        setBookingMessage('Booking confirmed successfully! 🎉');
        setTimeout(() => {
          // Reset and refresh
          setBookingStep('select');
          setReservedTickets([]);
          setSelectedTickets({ VIP: 0, 'Front Row': 0, GA: 0 });
          setUserId('');
          fetchAvailableTickets();
        }, 3000);
      } else {
        setError(response.data.data.message);
        setBookingStep('select');
        setReservedTickets([]);
        fetchAvailableTickets();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to confirm booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((total, [tier, quantity]) => {
      const tierInfo = tiers.find(t => t.name === tier);
      return total + (tierInfo ? tierInfo.price * quantity : 0);
    }, 0);
  };

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="ticket-booking-page">
      <header className="page-header">
        <h1>Ticket Booking System</h1>
        <p>Book your tickets for the upcoming event!</p>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {bookingMessage && bookingStep === 'select' && (
        <div className="success-banner">{bookingMessage}</div>
      )}

      {bookingStep === 'select' && (
        <div className="booking-container">
          {/* 
            TODO: Replace this manual userId input with proper authentication
            
            This section should be removed and replaced with:
            1. A welcome message showing the logged-in user's name
            2. A logout button
            
            Example:
              <div className="user-info-section">
                <p>Welcome, {user.name}!</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            
            Users should be redirected to /login if not authenticated
          */}
          <div className="user-id-section">
            <label htmlFor="userId">
              <strong>Your User ID:</strong>
            </label>
            <input
              id="userId"
              type="number"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="user-id-input"
            />
          </div>

          <div className="tickets-section">
            <h2>Available Tickets</h2>
            <div className="tickets-grid">
              {tiers.map((tier) => (
                <div key={tier.name} className="ticket-card">
                  <div className="ticket-header">
                    <h3>{tier.name}</h3>
                    <div className="ticket-price">${tier.price}</div>
                  </div>
                  <div className="ticket-body">
                    <p className="available-count">
                      Available: <strong>{tier.available}</strong> tickets
                    </p>
                    <div className="quantity-selector">
                      <label>Quantity:</label>
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            handleQuantityChange(tier.name, selectedTickets[tier.name] - 1)
                          }
                          disabled={selectedTickets[tier.name] === 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={tier.available}
                          value={selectedTickets[tier.name]}
                          onChange={(e) =>
                            handleQuantityChange(tier.name, parseInt(e.target.value) || 0)
                          }
                          className="quantity-input"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(tier.name, selectedTickets[tier.name] + 1)
                          }
                          disabled={selectedTickets[tier.name] >= tier.available}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {selectedTickets[tier.name] > 0 && (
                      <div className="subtotal">
                        Subtotal: ${tier.price * selectedTickets[tier.name]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              {Object.entries(selectedTickets).map(
                ([tier, quantity]) =>
                  quantity > 0 && (
                    <div key={tier} className="summary-item">
                      <span>
                        {tier} × {quantity}
                      </span>
                      <span>
                        $
                        {(tiers.find(t => t.name === tier)?.price || 0) * quantity}
                      </span>
                    </div>
                  )
              )}
              <div className="summary-total">
                <strong>Total:</strong>
                <strong>${calculateTotal()}</strong>
              </div>
            </div>
            <button
              className="reserve-button"
              onClick={handleReserveTickets}
              disabled={isProcessing || !userId || calculateTotal() === 0}
            >
              {isProcessing ? 'Reserving...' : 'Reserve Tickets'}
            </button>
          </div>
        </div>
      )}

      {bookingStep === 'confirm' && (
        <div className="confirmation-container">
          <h2>Confirm Your Booking</h2>
          <div className="reserved-tickets-list">
            <h3>Reserved Tickets:</h3>
            {reservedTickets.map((ticket) => (
              <div key={ticket.id} className="reserved-ticket-item">
                <span>Ticket #{ticket.id}</span>
                <span>{ticket.tier}</span>
                <span>${tiers.find(t => t.name === ticket.tier)?.price}</span>
              </div>
            ))}
          </div>

          <div className="payment-info">
            <h3>Payment Information</h3>
            <div className="payment-details">
              <p>
                <strong>Total Amount:</strong> ${calculateTotal()}
              </p>
              <div className="payment-form">
                <input
                  type="text"
                  placeholder="Card Number"
                  className="payment-input"
                  defaultValue="**** **** **** 1234"
                  disabled
                />
                <div className="payment-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="payment-input"
                    defaultValue="12/25"
                    disabled
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="payment-input"
                    defaultValue="123"
                    disabled
                  />
                </div>
                <p className="payment-note">
                  ℹ️ This is a simulated payment form. No actual payment will be processed.
                </p>
              </div>
            </div>
          </div>

          <div className="confirmation-buttons">
            <button
              className="confirm-button"
              onClick={() => handleConfirmBooking(true)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm & Pay'}
            </button>
            <button
              className="simulate-fail-button"
              onClick={() => handleConfirmBooking(false)}
              disabled={isProcessing}
            >
              Simulate Payment Failure
            </button>
          </div>

          {bookingMessage && (
            <div className="success-message">{bookingMessage}</div>
          )}
        </div>
      )}
    </div>
  );
};


