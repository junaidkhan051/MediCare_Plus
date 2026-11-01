import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import type { Appointment, Doctor } from '../../types/index.ts';
import {
  ClipboardList,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Clock,
  User,
  Phone,
  RotateCcw,
} from 'lucide-react';

interface ReceptionistDashboardProps {
  onOpenBooking: () => void;
  onOpenReschedule: (apt: Appointment) => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({
  onOpenBooking,
  onOpenReschedule,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [message, setMessage] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getAppointments({
        date: filterDate || undefined,
        doctorId: filterDoctor !== 'all' ? filterDoctor : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search || undefined,
      }),
      api.getDoctors(),
    ])
      .then(([apts, docs]) => {
        setAppointments(apts);
        setDoctors(docs);
      })
      .catch((err) => {
        console.error('Receptionist data load error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, filterDoctor, filterStatus, search]);

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await api.updateAppointmentStatus(id, status);
      setMessage(`Appointment ${id} status updated to ${status}.`);
      fetchData();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Confirmed</span>;
      case 'pending':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending</span>;
      case 'completed':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Completed</span>;
      case 'cancelled':
        return <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 line-through">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Clinic Reception Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Appointments & Patient Intake
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time appointment schedule, walk-in patient registrations, and slot management.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="px-5 py-2.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Booking / Walk-In</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-teal-600 hover:text-teal-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, patient, phone..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
            />
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] text-slate-700"
            />
          </div>

          {/* Doctor Dropdown */}
          <div>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] text-slate-700 bg-white"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => {
                setSearch('');
                setFilterDate('');
                setFilterDoctor('all');
                setFilterStatus('all');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Found <strong className="text-slate-800">{appointments.length}</strong> matching appointments</span>
          <button onClick={fetchData} className="text-blue-600 hover:underline">
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading clinic schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No appointments match current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Patient Info</th>
                  <th className="py-3 px-4">Doctor & Room</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {apt.bookingReference}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <p className="font-semibold text-slate-800">{apt.date}</p>
                      <p className="text-slate-500 text-[11px]">{apt.timeSlot}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{apt.patientName}</p>
                      <p className="text-slate-500 text-[11px]">{apt.patientPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{apt.doctorName}</p>
                      <p className="text-teal-700 text-[11px]">{apt.doctorSpecialty}</p>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(apt.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                            className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium text-[11px]"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                            className="px-2 py-1 bg-[#124E78] hover:bg-[#0d3b5b] text-white rounded font-medium text-[11px]"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => onOpenReschedule(apt)}
                          className="px-2 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[11px]"
                          title="Reschedule to another slot"
                        >
                          Reschedule
                        </button>
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                            className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
