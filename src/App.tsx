import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DemoBanner } from './components/DemoBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { RescheduleModal } from './components/RescheduleModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';

// Public Pages
import { Home } from './pages/Home.tsx';
import { FindDoctors } from './pages/FindDoctors.tsx';
import { DoctorDetails } from './pages/DoctorDetails.tsx';
import { Services } from './pages/Services.tsx';
import { AboutUs } from './pages/AboutUs.tsx';
import { Contact } from './pages/Contact.tsx';

// Dashboards
import { PatientDashboard } from './pages/dashboards/PatientDashboard.tsx';
import { DoctorDashboard } from './pages/dashboards/DoctorDashboard.tsx';
import { ReceptionistDashboard } from './pages/dashboards/ReceptionistDashboard.tsx';
import { AdminDashboard } from './pages/dashboards/AdminDashboard.tsx';

import type { Appointment } from './types/index.ts';

function MainApp() {
  const { user, role } = useAuth();

  // Navigation state: 'home' | 'doctors' | 'doctor-details' | 'services' | 'about' | 'contact' | 'dashboard'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpenBooking = (docId?: string) => {
    setBookingDoctorId(docId || null);
    setIsBookingOpen(true);
  };

  const handleSelectDoctorDetails = (docId: string) => {
    setSelectedDoctorId(docId);
    setActiveTab('doctor-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleAppointment(apt);
    setIsRescheduleOpen(true);
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            onOpenBooking={handleOpenBooking}
            onSelectDoctor={handleSelectDoctorDetails}
            onNavigate={setActiveTab}
          />
        );
      case 'doctors':
        return (
          <FindDoctors
            onSelectDoctor={handleSelectDoctorDetails}
            onOpenBooking={handleOpenBooking}
          />
        );
      case 'doctor-details':
        return (
          <DoctorDetails
            doctorId={selectedDoctorId || 'doc-1'}
            onBack={() => setActiveTab('doctors')}
            onOpenBooking={handleOpenBooking}
          />
        );
      case 'services':
        return (
          <Services
            onOpenBooking={handleOpenBooking}
            onSelectDoctor={handleSelectDoctorDetails}
          />
        );
      case 'about':
        return (
          <AboutUs
            onNavigate={setActiveTab}
            onOpenBooking={() => handleOpenBooking()}
          />
        );
      case 'contact':
        return <Contact />;
      case 'dashboard':
        if (!user) {
          return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Sign In to MediCare Plus</h2>
              <p className="text-xs text-slate-500">
                Please authenticate or select a demo role from the banner above to access dashboard operations.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 bg-[#124E78] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Sign In / Register
              </button>
            </div>
          );
        }

        switch (role) {
          case 'admin':
            return <AdminDashboard />;
          case 'doctor':
            return <DoctorDashboard />;
          case 'receptionist':
            return (
              <ReceptionistDashboard
                onOpenBooking={() => handleOpenBooking()}
                onOpenReschedule={handleOpenReschedule}
              />
            );
          case 'patient':
          default:
            return (
              <PatientDashboard
                onOpenBooking={() => handleOpenBooking()}
                onOpenReschedule={handleOpenReschedule}
              />
            );
        }
      default:
        return (
          <Home
            onOpenBooking={handleOpenBooking}
            onSelectDoctor={handleSelectDoctorDetails}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* 1. Fast Role Switcher for Portfolio Demonstration */}
      <DemoBanner onNavigateToDashboard={() => setActiveTab('dashboard')} />

      {/* 2. Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 3. Main Viewport */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* 4. Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* 5. Modals & Dialogs */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedDoctorId={bookingDoctorId}
        onBookingSuccess={() => {
          // If on dashboard, components will refresh on focus
        }}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleAppointment(null);
        }}
        appointment={rescheduleAppointment}
        onSuccess={() => {
          // Success callback
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
