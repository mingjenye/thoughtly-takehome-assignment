import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TicketBookingPage } from './pages/TicketBookingPage';
import { CreateTicketsPage } from './pages/CreateTicketsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="app-nav">
          <div className="nav-container">
            <h1 className="nav-logo">🎉 Thoughtly Ticket Booking System</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Book Tickets
              </Link>
              <Link to="/create-tickets" className="nav-link">
                Create Tickets (Admin)
              </Link>
            </div>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<TicketBookingPage />} />
            <Route path="/create-tickets" element={<CreateTicketsPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Thoughtly Ticket Booking System &copy; 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
