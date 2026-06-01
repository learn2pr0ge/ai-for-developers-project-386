import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestLayout } from './components/layout/GuestLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { LandingPage } from './pages/guest/LandingPage';
import { EventTypesPage } from './pages/guest/EventTypesPage';
import { SlotPickerPage } from './pages/guest/SlotPickerPage';
import { BookingSuccessPage } from './pages/guest/BookingSuccessPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminEventTypesPage } from './pages/admin/AdminEventTypesPage';

export default function App() {
  return (
    <Routes>
      {/* Гостевой флоу */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/event-types" element={<EventTypesPage />} />
        <Route path="/book/:eventTypeId" element={<SlotPickerPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
      </Route>

      {/* Админский флоу */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/bookings" replace />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="event-types" element={<AdminEventTypesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
