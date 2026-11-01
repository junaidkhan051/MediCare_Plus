import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Appointment } from '../../types/index.ts';
import {
  Calendar,
  Clock,
  User,
  Plus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface PatientDashboardProps {
  onOpenBooking: () => void;
  onOpenReschedule: (apt: Appointment) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onOpenBooking,
  onOpenReschedule,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Tab: 'upcoming' | 'history' | 'profile'
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'history' | 'profile'>('upcoming');

  const fetchAppointments = () => {
    setLoading(true);
    api.getAppointments()
      .then((data) => {
        setAppointments(data);
      })
      .catch((err) => {
        console.error('Error fetching patient appointments:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];

  const upcoming = appointments.filter(
    (a) => (a.status === 'confirmed' || a.status === 'pending') && a.date >= todayStr
  );

  const history = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.date < todayStr
  );

  const handleCancelAppointment = async (id: string) => {
    setCancellingId(id);
    try {
      await api.updateAppointmentStatus(id, 'cancelled', 'Cancelled by patient');
      setMessage('Appointment successfully cancelled. The slot has been released.');
      setConfirmCancelId(null);
      fetchAppointments();
    } catch (err: any) {
      alert('Failed to cancel: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#124E78] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 line-through">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your consultations, manage upcoming clinic visits, or schedule a new appointment.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-teal-600 hover:text-teal-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'upcoming'
              ? 'bg-[#124E78] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Appointments ({upcoming.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-[#124E78] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Appointment History ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'profile'
              ? 'bg-[#124E78] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : activeSubTab === 'upcoming' ? (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No Upcoming Appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have any scheduled consultations. Choose a specialist to book your next visit.
              </p>
              <button
                onClick={onOpenBooking}
                className="mt-2 px-4 py-2 bg-[#124E78] text-white text-xs font-semibold rounded-lg"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-mono text-xs font-bold text-[#124E78] tabular-nums">
                        {apt.bookingReference}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div>
                      <p className="text-xs text-teal-700 font-semibold">{apt.doctorSpecialty}</p>
                      <h3 className="font-bold text-base text-slate-900">{apt.doctorName}</h3>
                      <p className="text-xs text-slate-500">{apt.serviceName}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Date & Time:</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {apt.date} at {apt.timeSlot}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Duration & Fee:</span>
                        <span className="text-slate-800 tabular-nums">
                          {apt.durationMinutes} mins · ${apt.fee}
                        </span>
                      </div>
                      {apt.reason && (
                        <div className="pt-1 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-600">Reason:</span> {apt.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenReschedule(apt)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                      <span>Reschedule</span>
                    </button>

                    {confirmCancelId === apt.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-rose-600">Cancel?</span>
                        <button
                          disabled={cancellingId === apt.id}
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-semibold rounded hover:bg-rose-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="px-2 py-1 text-slate-500 text-[11px] hover:text-slate-800"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(apt.id)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'history' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No past appointment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Doctor & Specialty</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Doctor Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 tabular-nums">
                        {apt.bookingReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{apt.doctorName}</p>
                        <p className="text-[11px] text-teal-700">{apt.doctorSpecialty}</p>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <p className="text-slate-800 font-medium">{apt.date}</p>
                        <p className="text-slate-500 text-[11px]">{apt.timeSlot}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">${apt.fee}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(apt.status)}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {apt.notes || 'Routine consultation completed.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Profile Settings */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-xl space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900">Patient Profile Information</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Full Name</span>
              <p className="font-semibold text-slate-800 text-sm">{user?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Registered Email</span>
              <p className="font-semibold text-slate-800 text-sm">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Contact Phone</span>
              <p className="font-semibold text-slate-800 text-sm">{user?.phone || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Account Role</span>
              <p className="font-semibold text-teal-700 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
