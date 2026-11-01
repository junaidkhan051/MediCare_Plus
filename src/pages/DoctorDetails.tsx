import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { Doctor } from '../types/index.ts';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Award,
  ChevronLeft,
  CheckCircle2,
  Stethoscope,
  Shield,
  Star,
} from 'lucide-react';

interface DoctorDetailsProps {
  doctorId: string;
  onBack: () => void;
  onOpenBooking: (doctorId: string) => void;
}

export const DoctorDetails: React.FC<DoctorDetailsProps> = ({
  doctorId,
  onBack,
  onOpenBooking,
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar preview
  const [previewDate, setPreviewDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    api.getDoctor(doctorId)
      .then((doc) => {
        setDoctor(doc);
      })
      .catch((err) => {
        setError('Doctor details could not be loaded: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [doctorId]);

  useEffect(() => {
    if (doctorId && previewDate) {
      setLoadingSlots(true);
      api.getDoctorAvailability(doctorId, previewDate)
        .then((data) => {
          setAvailableSlots(data.availableSlots);
        })
        .catch(() => {
          setAvailableSlots([]);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [doctorId, previewDate]);

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        <div className="w-8 h-8 border-2 border-[#124E78] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>Loading medical specialist profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">{error || 'Doctor not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Specialists</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Doctor Portrait */}
          <div className="md:col-span-4 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
            {doctor.photoUrl ? (
              <img
                src={doctor.photoUrl}
                alt={doctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-[#124E78]">
                <Stethoscope className="w-16 h-16 text-teal-600 mb-2" />
                <span className="text-xs font-semibold">{doctor.specialization}</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-md text-xs font-bold text-[#124E78] shadow-xs tabular-nums">
              ${doctor.consultationFee} Consultation
            </div>
          </div>

          {/* Bio & Credentials */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">{doctor.specialization}</span>
                {doctor.rating && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{doctor.rating}</span>
                    <span className="text-slate-400 font-normal">({doctor.reviewCount} reviews)</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{doctor.name}</h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">{doctor.qualifications}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 pb-2 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Experience</span>
                <span className="font-bold text-slate-800 tabular-nums">{doctor.experience} Years</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Clinic Wing</span>
                <span className="font-bold text-slate-800">{doctor.clinicRoom}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <span className="font-bold text-teal-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepting Patients
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Professional Biography</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{doctor.biography}</p>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onOpenBooking(doctor.id)}
                className="px-6 py-3 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment With {doctor.name.split(' ')[1] || doctor.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Working Schedule & Live Slot Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Hours */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#124E78]" />
            <h3 className="font-bold text-sm text-slate-900">Standard Working Schedule</h3>
          </div>
          <p className="text-xs text-slate-500">
            Consultations are held according to clinical department rotations in 30-minute blocks.
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            {doctor.schedule.map((sch) => (
              <div key={sch.dayOfWeek} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-800">{daysMap[sch.dayOfWeek]}</span>
                <span className="text-slate-600 tabular-nums">
                  {sch.startTime} - {sch.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Slot Checker for Selected Date */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Preview Available Slots</h3>
              <p className="text-xs text-slate-500">Check open consultation times for a specific date</p>
            </div>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={previewDate}
              onChange={(e) => setPreviewDate(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
            />
          </div>

          {loadingSlots ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading schedule for {previewDate}...</div>
          ) : availableSlots.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl p-4">
              <p className="font-semibold text-slate-700">No open consultation slots on this date.</p>
              <p className="mt-1">The doctor may be off or all appointments are currently booked.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-teal-700 font-semibold">
                ✓ {availableSlots.length} available slots on {previewDate}:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onOpenBooking(doctor.id)}
                    className="py-2 text-xs font-semibold text-slate-800 bg-teal-50/50 border border-teal-200 rounded-lg hover:bg-[#124E78] hover:text-white hover:border-[#124E78] transition-colors tabular-nums"
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Click any slot or the button above to reserve this time in the official clinic booking engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
