import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Appointment, Doctor } from '../../types/index.ts';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  Save,
  Activity,
  ChevronRight,
  Filter,
  Check,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Sub tab: 'today' | 'upcoming' | 'requests' | 'availability' | 'profile'
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'requests' | 'availability' | 'profile'>('today');

  // Edit notes state
  const [selectedAptForNotes, setSelectedAptForNotes] = useState<Appointment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // Doctor profile editable fields
  const [fee, setFee] = useState<number>(160);
  const [bio, setBio] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const allDocs = await api.getDoctors();
      // Match by doctor userId or name, default to first doctor
      const matched =
        allDocs.find((d) => d.userId === user?.id || d.name === user?.name) ||
        allDocs[0];
      setCurrentDoctor(matched);
      setFee(matched.consultationFee);
      setBio(matched.biography);
      setRoom(matched.clinicRoom);

      // Load appointments for this doctor
      const apts = await api.getAppointments({ doctorId: matched.id });
      setAppointments(apts);
    } catch (err) {
      console.error('Error fetching doctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr && a.status !== 'cancelled'
  );

  const pendingRequests = appointments.filter(
    (a) => a.status === 'pending'
  );

  const upcomingAppointments = appointments.filter(
    (a) => a.date > todayStr && a.status !== 'cancelled'
  );

  const handleUpdateStatus = async (aptId: string, status: any, notes?: string) => {
    try {
      await api.updateAppointmentStatus(aptId, status, notes);
      setActionMessage(`Appointment successfully marked as ${status}.`);
      setSelectedAptForNotes(null);
      fetchDoctorData();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) return;
    setSavingProfile(true);
    try {
      await api.updateDoctor(currentDoctor.id, {
        consultationFee: Number(fee),
        biography: bio,
        clinicRoom: room,
      });
      setActionMessage('Doctor profile successfully updated.');
    } catch (err: any) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Practice Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentDoctor?.name || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Specialist in <strong className="text-slate-800">{currentDoctor?.specialization}</strong> · {currentDoctor?.clinicRoom}
          </p>
        </div>

        {/* Quick metrics */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-center min-w-[90px]">
            <span className="text-xs text-slate-500 block">Today's Total</span>
            <span className="text-xl font-bold text-[#124E78] tabular-nums">{todayAppointments.length}</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-center min-w-[90px]">
            <span className="text-xs text-amber-700 block">Pending</span>
            <span className="text-xl font-bold text-amber-800 tabular-nums">{pendingRequests.length}</span>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-teal-600 hover:text-teal-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'today' ? 'bg-[#124E78] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today's Consultations ({todayAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'requests' ? 'bg-[#124E78] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Patient Requests ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upcoming' ? 'bg-[#124E78] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Upcoming Schedule ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-[#124E78] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Practice Profile & Fee</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading consultation schedule...</div>
      ) : activeTab === 'today' ? (
        <div className="space-y-4">
          {todayAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No Consultations Scheduled for Today</p>
              <p className="text-xs text-slate-500">Enjoy your preparation time or review upcoming dates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-teal-700 tabular-nums">
                        Slot: {apt.timeSlot} ({apt.durationMinutes} mins)
                      </span>
                      <span className="font-mono text-xs text-slate-400">{apt.bookingReference}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900">{apt.patientName}</h3>
                      <p className="text-xs text-slate-500">{apt.patientPhone} · {apt.patientEmail}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <span className="font-semibold text-slate-700 block">Service: {apt.serviceName}</span>
                      <p className="text-slate-600 italic">"{apt.reason || 'Routine consultation'}"</p>
                      {apt.notes && (
                        <p className="text-blue-800 bg-blue-50/70 p-2 rounded mt-2 text-[11px]">
                          <strong>Clinical Notes:</strong> {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedAptForNotes(apt);
                        setDoctorNotes(apt.notes || '');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{apt.notes ? 'Edit Notes' : 'Add Notes'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {apt.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed', apt.notes)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled', 'Cancelled by doctor')}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'requests' ? (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No pending appointment requests currently require review.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{req.patientName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-teal-700 font-medium">{req.serviceName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-500">{req.bookingReference}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Requested: <strong className="text-slate-800">{req.date} at {req.timeSlot}</strong>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 italic">"{req.reason}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'confirmed')}
                      className="px-3.5 py-1.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Request</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'cancelled', 'Doctor unavailable for this request')}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'upcoming' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 tabular-nums">
                      <p className="font-bold text-slate-800">{apt.date}</p>
                      <p className="text-slate-500 text-[11px]">{apt.timeSlot}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{apt.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{apt.patientPhone}</td>
                    <td className="py-3.5 px-4 text-teal-700">{apt.serviceName}</td>
                    <td className="py-3.5 px-4 capitalize font-medium">{apt.status}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled', 'Cancelled by doctor')}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Doctor Profile & Fee */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Physician Profile Settings</h3>
            <p className="text-xs text-slate-500">Configure consultation fee and practice details visible in the directory.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($ USD)</label>
              <input
                type="number"
                min="50"
                max="500"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Consultation Suite</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Professional Biography</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Clinical Notes Dialog */}
      {selectedAptForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Consultation Notes for {selectedAptForNotes.patientName}
            </h3>
            <textarea
              rows={4}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Record follow-up advice, routine vitals check summary, or prescription renewal notes..."
              className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedAptForNotes(null)}
                className="px-3 py-2 text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAptForNotes.id, selectedAptForNotes.status, doctorNotes)}
                className="px-4 py-2 bg-[#124E78] text-white font-semibold rounded-lg"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
