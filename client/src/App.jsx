import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import PaymentPage from './pages/PaymentPage';
import BookingSuccess from './pages/BookingSuccess';
import MyTickets from './pages/MyTickets';
import Login from './pages/Login';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Help from './pages/Help';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/book/:showId" element={<SeatSelection />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
