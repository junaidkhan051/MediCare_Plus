import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { Doctor, MedicalService } from '../types/index.ts';
import {
  Calendar,
  Search,
  ShieldCheck,
  Clock,
  Award,
  Users,
  ChevronRight,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Activity,
  Baby,
  Sparkles,
  Smile,
  HelpCircle,
  MapPin,
  Phone,
} from 'lucide-react';
import { ImageWithFallback } from '../components/common/ImageWithFallback.tsx';

interface HomeProps {
  onOpenBooking: (doctorId?: string) => void;
  onSelectDoctor: (doctorId: string) => void;
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  onOpenBooking,
  onSelectDoctor,
  onNavigate,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [searchSpecialty, setSearchSpecialty] = useState<string>('All');
  const [searchName, setSearchName] = useState<string>('');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getServices()])
      .then(([docList, srvList]) => {
        setDoctors(docList);
        setServices(srvList);
      })
      .catch((err) => {
        console.error('Error fetching home data:', err);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('doctors');
  };

  const specialties = [
    { name: 'Cardiology', icon: HeartPulse, desc: 'Advanced cardiovascular diagnostics and preventative care.' },
    { name: 'Orthopedics', icon: Activity, desc: 'Musculoskeletal injuries, joint care, and physical recovery.' },
    { name: 'Pediatrics', icon: Baby, desc: 'Compassionate pediatric wellness and milestone monitoring.' },
    { name: 'Dermatology', icon: Sparkles, desc: 'Clinical skin screenings, dermoscopy, and customized therapies.' },
    { name: 'General Consultation', icon: Stethoscope, desc: 'Primary physical evaluations and preventative health management.' },
    { name: 'Dental Care', icon: Smile, desc: 'Preventative oral examinations and restorative consultations.' },
  ];

  const faqs = [
    {
      q: 'How does online appointment slot reservation work?',
      a: 'Select your preferred doctor, pick an open date, and choose an available time slot. Once confirmed, the system immediately reserves your slot and provides a unique booking reference (e.g., MCP-2026-XXXX).',
    },
    {
      q: 'Can I reschedule or cancel my appointment later?',
      a: 'Yes. You can access your appointments at any time using your patient dashboard or booking reference. You can reschedule to another available slot or cancel with zero cancellation fees.',
    },
    {
      q: 'Are same-day consultations available?',
      a: 'Yes, same-day appointments are bookable as long as slots remain open and the scheduled time is at least 15 minutes in advance. The clinic also accepts walk-in triages via the reception desk.',
    },
    {
      q: 'What should I bring to my consultation?',
      a: 'Please bring a photo ID, your insurance card (if applicable), your booking reference number, and any relevant prior medical records or prescriptions.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 lg:pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#124E78] bg-blue-50/80 px-3 py-1.5 rounded-md border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Specialist Clinic & Diagnostic Center</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1] text-balance">
                Your Health, <br />
                <span className="text-[#124E78]">Our Priority.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
                Find trusted healthcare professionals and book your appointments with ease. Immediate slot confirmation, real-time availability, and comprehensive multi-specialty clinical care.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="px-6 py-3 bg-[#124E78] hover:bg-[#0d3b5b] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={() => onNavigate('doctors')}
                  className="px-6 py-3 border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span>Explore Doctors</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Search Widget */}
              <form
                onSubmit={handleSearchSubmit}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs max-w-xl flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search doctor name or symptom..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <select
                    value={searchSpecialty}
                    onChange={(e) => setSearchSpecialty(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] text-slate-700"
                  >
                    <option value="All">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Consultation">General Medicine</option>
                    <option value="Dental Care">Dental Care</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-16/9 lg:aspect-4/3 bg-slate-100">
                <ImageWithFallback
                  src="/images/medicare_hero_clinic.jpg"
                  alt="MediCare Plus Modern Healthcare Clinic Reception"
                  fallbackType="facility"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-300">Metro Health District</p>
                  <p className="text-sm font-semibold text-white">State-of-the-Art Outpatient Facility</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-column key metrics strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#124E78] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 tabular-nums">8+</p>
                <p className="text-xs text-slate-500">Board-Certified Specialists</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 tabular-nums">30 Min</p>
                <p className="text-xs text-slate-500">Dedicated Consultations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#124E78] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 tabular-nums">100%</p>
                <p className="text-xs text-slate-500">Verified Slot Availability</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 tabular-nums">7 Depts</p>
                <p className="text-xs text-slate-500">Comprehensive Specialties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED MEDICAL SPECIALTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Departments</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Medical Specialties</h2>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Medical Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {specialties.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.name}
                onClick={() => onNavigate('services')}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#124E78] group-hover:bg-[#124E78] group-hover:text-white transition-colors flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{spec.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{spec.desc}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium text-teal-700 group-hover:translate-x-1 transition-transform">
                    Explore Department →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED DOCTORS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Clinical Staff</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Medical Specialists</h2>
          </div>
          <button
            onClick={() => onNavigate('doctors')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Browse Full Directory ({doctors.length} Doctors)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-500 transition-all flex flex-col"
            >
              <div className="aspect-4/3 bg-slate-100 overflow-hidden relative">
                <ImageWithFallback
                  src={doc.photoUrl}
                  alt={doc.name}
                  fallbackType="doctor"
                  doctorSpecialty={doc.specialization}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-bold text-[#124E78] shadow-xs tabular-nums">
                  ${doc.consultationFee}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="text-teal-700 font-semibold">{doc.specialization}</span>
                    <span className="tabular-nums">{doc.experience} yrs exp</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{doc.qualifications}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{doc.biography}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDoctor(doc.id)}
                    className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onOpenBooking(doc.id)}
                    className="flex-1 py-2 px-3 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors text-center"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW APPOINTMENT BOOKING WORKS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">How Appointment Booking Works</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Our scheduling engine guarantees that when you select an open slot, it is locked immediately to avoid double bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select Doctor',
                desc: 'Browse our directory by specialty, experience, and fee to select your practitioner.',
              },
              {
                step: '02',
                title: 'Choose Date',
                desc: 'Pick your preferred consultation date from the doctor’s active clinical schedule.',
              },
              {
                step: '03',
                title: 'Pick Time Slot',
                desc: 'Select from real-time available 30-minute consultation slots.',
              },
              {
                step: '04',
                title: 'Instant Confirmation',
                desc: 'Receive your unique booking reference number with zero wait time.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                <span className="text-2xl font-black text-blue-100 block mb-2 font-mono">{item.step}</span>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => onOpenBooking()}
              className="px-6 py-3 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Start Booking Now
            </button>
          </div>
        </div>
      </section>

      {/* 5. CLINIC INFORMATION & OPENING HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Patient Facilities</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Modern Diagnostic Center & Consultation Rooms</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MediCare Plus operates modern diagnostic examination suites equipped for non-invasive cardiovascular reviews, dermatological imaging, and gentle pediatric consultations. All consultation rooms are fully air-filtered and accessible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Clinic Address</span>
                </div>
                <p className="text-xs text-slate-500">450 Healthcare Boulevard, Suite 300, Metro Health District</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>Direct Reception Desk</span>
                </div>
                <p className="text-xs text-slate-500">+1 (800) 456-7890 · Mon-Sat</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-16/9 bg-slate-100">
              <ImageWithFallback
                src="/images/clinic_facility_suite.jpg"
                alt="Clinic Diagnostic and Consultation Suite"
                fallbackType="facility"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. PATIENT FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Common Questions</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={faq.q}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full text-left p-4 text-xs sm:text-sm font-semibold text-slate-900 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-mono text-base">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
