import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { Appointment } from '../types/index.ts';
import { X, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: (updated: Appointment) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {
  const [newDate, setNewDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (appointment) {
      setNewDate(appointment.date);
      setNewSlot('');
      setError(null);
    }
  }, [appointment]);

  useEffect(() => {
    if (appointment && newDate) {
      setLoading(true);
      setError(null);
      api.getDoctorAvailability(appointment.doctorId, newDate)
        .then((data) => {
          setAllSlots(data.slots);
          setBookedSlots(data.bookedSlots);
          // If the date is the current appointment date, current slot can be allowed
          const free = data.availableSlots.concat(
            appointment.date === newDate ? [appointment.timeSlot] : []
          );
          setAvailableSlots(Array.from(new Set(free)));
        })
        .catch((err) => {
          setError('Failed to fetch doctor schedule: ' + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [appointment, newDate]);

  if (!isOpen || !appointment) return null;

  const handleReschedule = async () => {
    if (!newDate || !newSlot) {
      setError('Please choose both a new date and an available time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.rescheduleAppointment(appointment.id, newDate, newSlot);
      onSuccess(res.appointment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Rescheduling failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-[#124E78] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Reschedule Appointment</h3>
            <p className="text-[11px] text-blue-100">Ref: {appointment.bookingReference}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-slate-800">Current Booking Details:</p>
            <p className="text-slate-600">Doctor: {appointment.doctorName} ({appointment.doctorSpecialty})</p>
            <p className="text-slate-600">Scheduled: {appointment.date} at {appointment.timeSlot}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Date</label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="date"
                min={todayStr}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Time Slot</label>
            {loading ? (
              <div className="text-xs text-slate-500 py-3 text-center">Loading open slots...</div>
            ) : allSlots.length === 0 ? (
              <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg text-center">
                No slots scheduled for this date.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1">
                {allSlots.map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  const isSelected = newSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setNewSlot(slot)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md border text-center transition-all tabular-nums ${
                        isSelected
                          ? 'bg-[#124E78] text-white border-[#124E78]'
                          : isAvailable
                          ? 'bg-white text-slate-800 border-slate-200 hover:border-teal-500'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || !newSlot}
              onClick={handleReschedule}
              className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
