import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Doctor, MedicalService, Appointment } from '../types/index.ts';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  MapPin,
  FileText,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string | null;
  onBookingSuccess?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctorId,
  onBookingSuccess,
}) => {
  const { user } = useAuth();

  // Wizard state: 1..6
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data lists
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);

  // Selections
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<MedicalService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Slots availability
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Patient inputs
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Confirmed result
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Load doctors & services on open
  useEffect(() => {
    if (!isOpen) return;

    // Prefill patient inputs if user is logged in
    if (user) {
      setPatientName(user.name || '');
      setPatientEmail(user.email || '');
      setPatientPhone(user.phone || '');
    }

    // Default min date to tomorrow or today
    const today = new Date().toISOString().split('T')[0];
    if (!selectedDate) {
      setSelectedDate(today);
    }

    Promise.all([api.getDoctors(), api.getServices()])
      .then(([docList, srvList]) => {
        setDoctors(docList);
        setServices(srvList);

        if (preselectedDoctorId) {
          const match = docList.find((d) => d.id === preselectedDoctorId);
          if (match) {
            setSelectedDoctor(match);
            setStep(2); // advance to date step
          }
        }
      })
      .catch((err) => {
        setError('Failed to load clinic scheduling data: ' + err.message);
      });
  }, [isOpen, preselectedDoctorId, user]);

  // Load slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot('');

      api.getDoctorAvailability(selectedDoctor.id, selectedDate)
        .then((data) => {
          setAllSlots(data.slots);
          setBookedSlots(data.bookedSlots);
          setAvailableSlots(data.availableSlots);
        })
        .catch((err) => {
          setError('Could not verify slot availability: ' + err.message);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [selectedDoctor, selectedDate]);

  if (!isOpen) return null;

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // Find matching service if applicable
    const matchedService = services.find(
      (s) => s.doctorSpecialty.toLowerCase() === doctor.specialization.toLowerCase()
    );
    if (matchedService) {
      setSelectedService(matchedService);
    }
    setError(null);
    setStep(2);
  };

  const handleNextToSlots = () => {
    if (!selectedDate) {
      setError('Please choose an appointment date.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleNextToPatient = () => {
    if (!selectedSlot) {
      setError('Please choose an available appointment time slot.');
      return;
    }
    setError(null);
    setStep(4);
  };

  const handleNextToReview = () => {
    if (!patientName.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!patientPhone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }
    setError(null);
    setStep(5);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Booking details are incomplete.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createAppointment({
        doctorId: selectedDoctor.id,
        serviceId: selectedService?.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        patientName,
        patientEmail,
        patientPhone,
        reason,
      });

      setConfirmedAppointment(res.appointment);
      setStep(6);
      onBookingSuccess?.(res.appointment);
    } catch (err: any) {
      // Backend double-booking protection or error
      setError(err.message || 'Slot collision occurred. Please select another time slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot('');
    setError(null);
    setConfirmedAppointment(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#124E78] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500 text-slate-900 flex items-center justify-center font-bold text-xs">
              M+
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Book Clinic Appointment</h3>
              <p className="text-[11px] text-blue-100">Direct Doctor Scheduling · Instant Slot Reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-blue-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            {['Doctor', 'Date', 'Time Slot', 'Details', 'Review', 'Confirmed'].map((label, idx) => {
              const num = idx + 1;
              const isActive = step === num;
              const isDone = step > num;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-teal-500 text-white'
                        : isActive
                        ? 'bg-[#124E78] text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : num}
                  </div>
                  <span
                    className={`hidden sm:inline ${
                      isActive ? 'text-[#124E78] font-bold' : isDone ? 'text-teal-700' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                  {idx < 5 && <span className="text-slate-300 hidden sm:inline">→</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT DOCTOR */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Step 1: Choose a Medical Specialist</h4>
                <p className="text-xs text-slate-500">Select the doctor you wish to consult with.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc)}
                    className="p-3 border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-xs cursor-pointer transition-all flex items-center gap-3 bg-white"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                      {doc.photoUrl ? (
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Stethoscope className="w-6 h-6 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-teal-600 font-medium">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-500">{doc.qualifications}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-semibold text-slate-800 tabular-nums">${doc.consultationFee} fee</span>
                        <span className="text-slate-400">{doc.clinicRoom}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE */}
          {step === 2 && selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Step 2: Select Appointment Date</h4>
                  <p className="text-xs text-slate-500">
                    Consultation with <span className="font-semibold text-slate-800">{selectedDoctor.name}</span> ({selectedDoctor.specialization})
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Change Doctor</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Choose Preferred Date (Mon-Sat appointments)
                </label>
                <div className="relative max-w-xs">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Note: Selected doctor working days are active based on clinical schedule. Past dates cannot be booked.
                </p>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700">
                <p className="font-semibold text-blue-950 mb-1">Clinic Notice</p>
                <p>Appointments are booked in 30-minute consultation blocks. Urgent walk-ins are accommodated via the reception desk.</p>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT TIME SLOT */}
          {step === 3 && selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Step 3: Select Available Time Slot</h4>
                  <p className="text-xs text-slate-500">
                    Date: <span className="font-semibold text-slate-800">{selectedDate}</span> with {selectedDoctor.name}
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Date</span>
                </button>
              </div>

              {loadingSlots ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <span>Checking live schedule availability...</span>
                </div>
              ) : allSlots.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-700">{selectedDoctor.name} is not scheduled on this day.</p>
                  <p className="mt-1">Please select an alternative date (Monday through Friday or Saturday).</p>
                  <button
                    onClick={() => setStep(2)}
                    className="mt-3 px-3 py-1.5 text-xs bg-slate-800 text-white rounded-md"
                  >
                    Select Different Date
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Available Consultation Slots ({availableSlots.length} open):</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-xs bg-white border border-teal-500 inline-block" /> Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-300 inline-block" /> Booked
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {allSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isAvailable = availableSlots.includes(slot);
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all tabular-nums text-center ${
                            isSelected
                              ? 'bg-[#124E78] text-white border-[#124E78] shadow-xs'
                              : isAvailable
                              ? 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PATIENT DETAILS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Step 4: Patient Information</h4>
                  <p className="text-xs text-slate-500">Provide contact information for booking confirmations and clinic records.</p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Time</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. James Wilson"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Appointment Reason / Symptoms (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Annual health review, persistent headaches, blood pressure check..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW INFORMATION */}
          {step === 5 && selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Step 5: Review Appointment Summary</h4>
                  <p className="text-xs text-slate-500">Verify your consultation details before finalizing reservation.</p>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-start justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Physician</span>
                    <p className="font-bold text-sm text-slate-900">{selectedDoctor.name}</p>
                    <p className="text-teal-700 font-medium">{selectedDoctor.specialization}</p>
                    <p className="text-slate-500">{selectedDoctor.clinicRoom}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consultation Fee</span>
                    <p className="text-base font-bold text-[#124E78] tabular-nums">${selectedDoctor.consultationFee}</p>
                    <p className="text-slate-500 text-[10px]">Payable at Clinic Reception</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scheduled Date</span>
                    <p className="font-semibold text-slate-800">{selectedDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Slot</span>
                    <p className="font-semibold text-slate-800 tabular-nums">{selectedSlot} (30 mins)</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Details</span>
                  <p className="font-semibold text-slate-800">{patientName}</p>
                  <p className="text-slate-600">{patientEmail} · {patientPhone}</p>
                  {reason && <p className="text-slate-500 italic mt-1">"{reason}"</p>}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                By confirming, your appointment slot will be instantly reserved in the clinic schedule. A confirmation reference will be issued.
              </p>
            </div>
          )}

          {/* STEP 6: CONFIRMATION */}
          {step === 6 && confirmedAppointment && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your appointment has been successfully scheduled with MediCare Plus.
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-sm text-[#124E78] tabular-nums">
                    {confirmedAppointment.bookingReference}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.doctorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Specialty:</span>
                  <span className="text-teal-700 font-medium">{confirmedAppointment.doctorSpecialty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {confirmedAppointment.date} at {confirmedAppointment.timeSlot}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.patientName}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Done / Close
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Step navigation) */}
        {step < 6 && (
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(step - 1);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div>
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleNextToSlots}
                  className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Select Time</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleNextToPatient}
                  disabled={!selectedSlot}
                  className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Enter Patient Info</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={handleNextToReview}
                  className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Review Booking</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 5 && (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Securing Slot...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Lock Appointment</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
