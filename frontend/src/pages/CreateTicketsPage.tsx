import React, { useState } from 'react';
import { ticketsAPI } from '../services/api';
import './CreateTicketsPage.css';

export const CreateTicketsPage: React.FC = () => {
  const [vipCount, setVipCount] = useState<number>(0);
  const [frontRowCount, setFrontRowCount] = useState<number>(0);
  const [gaCount, setGaCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (vipCount === 0 && frontRowCount === 0 && gaCount === 0) {
      setError('Please enter at least one ticket count');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await ticketsAPI.createTickets({
        eventId: 1,
        vipCount,
        frontRowCount,
        gaCount,
      });

      setSuccess(
        `Successfully created ${response.data.data.created} tickets! (VIP: ${vipCount}, Front Row: ${frontRowCount}, GA: ${gaCount})`
      );
      
      // Reset form
      setVipCount(0);
      setFrontRowCount(0);
      setGaCount(0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number
  ) => {
    setter(value + 1);
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number
  ) => {
    if (value > 0) {
      setter(value - 1);
    }
  };

  return (
    <div className="create-tickets-page">
      <header className="page-header">
        <h1>🎫 Create Concert Tickets</h1>
        <p>Admin interface to add new tickets to the system</p>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-banner">
          <strong>Success!</strong> {success}
        </div>
      )}

      <div className="create-tickets-container">
        <form onSubmit={handleSubmit} className="create-tickets-form">
          <div className="tier-input-section">
            <div className="tier-input-card">
              <div className="tier-header vip-header">
                <h3>VIP Tickets</h3>
                <span className="tier-price">$100</span>
              </div>
              <div className="tier-body">
                <label htmlFor="vipCount">Number of tickets to create:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => handleDecrement(setVipCount, vipCount)}
                    disabled={vipCount === 0}
                  >
                    -
                  </button>
                  <input
                    id="vipCount"
                    type="number"
                    min="0"
                    value={vipCount}
                    onChange={(e) => setVipCount(parseInt(e.target.value) || 0)}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleIncrement(setVipCount, vipCount)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="tier-input-card">
              <div className="tier-header frontrow-header">
                <h3>Front Row Tickets</h3>
                <span className="tier-price">$50</span>
              </div>
              <div className="tier-body">
                <label htmlFor="frontRowCount">Number of tickets to create:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => handleDecrement(setFrontRowCount, frontRowCount)}
                    disabled={frontRowCount === 0}
                  >
                    -
                  </button>
                  <input
                    id="frontRowCount"
                    type="number"
                    min="0"
                    value={frontRowCount}
                    onChange={(e) => setFrontRowCount(parseInt(e.target.value) || 0)}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleIncrement(setFrontRowCount, frontRowCount)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="tier-input-card">
              <div className="tier-header ga-header">
                <h3>GA Tickets</h3>
                <span className="tier-price">$10</span>
              </div>
              <div className="tier-body">
                <label htmlFor="gaCount">Number of tickets to create:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => handleDecrement(setGaCount, gaCount)}
                    disabled={gaCount === 0}
                  >
                    -
                  </button>
                  <input
                    id="gaCount"
                    type="number"
                    min="0"
                    value={gaCount}
                    onChange={(e) => setGaCount(parseInt(e.target.value) || 0)}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleIncrement(setGaCount, gaCount)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Summary</h3>
            <div className="summary-content">
              <div className="summary-row">
                <span>VIP Tickets:</span>
                <strong>{vipCount}</strong>
              </div>
              <div className="summary-row">
                <span>Front Row Tickets:</span>
                <strong>{frontRowCount}</strong>
              </div>
              <div className="summary-row">
                <span>GA Tickets:</span>
                <strong>{gaCount}</strong>
              </div>
              <div className="summary-row total-row">
                <span>Total Tickets:</span>
                <strong>{vipCount + frontRowCount + gaCount}</strong>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="create-button"
            disabled={loading || (vipCount === 0 && frontRowCount === 0 && gaCount === 0)}
          >
            {loading ? 'Creating Tickets...' : 'Create Tickets'}
          </button>
        </form>

        <div className="info-section">
          <h3>ℹ️ Instructions</h3>
          <ul>
            <li>Use this interface to add new tickets to the event</li>
            <li>Each ticket will be assigned a unique ID sequentially</li>
            <li>Tickets will be created in "available" status</li>
            <li>The event's available ticket counts will be updated automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


