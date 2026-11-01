import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Calendar, UserCircle, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: (doctorId?: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenAuth,
}) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLabel = () => {
    switch (role) {
      case 'admin':
        return 'Admin Portal';
      case 'doctor':
        return 'Doctor Portal';
      case 'receptionist':
        return 'Reception Desk';
      default:
        return 'My Appointments';
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'doctors', label: 'Find Doctors' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark (Single line, text element) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left text-slate-900 focus-visible:outline-hidden group whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#124E78] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-[#0e3d5e] transition-colors">
              M+
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#124E78]">
                MediCare<span className="text-[#15B8A6]">Plus</span>
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                  activeTab === link.id
                    ? 'border-[#15B8A6] text-[#124E78] font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}

            {user && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                  activeTab === 'dashboard'
                    ? 'border-[#15B8A6] text-[#124E78] font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                <span>{getDashboardLabel()}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  title="View Profile and Dashboard"
                >
                  <UserCircle className="w-4 h-4 text-[#124E78]" />
                  <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                </button>
                <button
                  onClick={() => onOpenBooking()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#124E78] hover:bg-[#0d3b5b] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenBooking()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#124E78] hover:bg-[#0d3b5b] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => onOpenBooking()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#124E78] rounded-md"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus-visible:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                activeTab === link.id
                  ? 'bg-blue-50 text-[#124E78] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {user && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-[#124E78] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-teal-600" />
              <span>{getDashboardLabel()}</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-slate-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-rose-600 font-medium hover:underline"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
