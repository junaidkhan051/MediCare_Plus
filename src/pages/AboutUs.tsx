import { ShieldCheck, Heart, Building2, Users, Clock, CheckCircle2, Phone, MapPin, Mail } from 'lucide-react';
import { ImageWithFallback } from '../components/common/ImageWithFallback.tsx';

interface AboutUsProps {
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero statement */}
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">About Our Practice</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Comprehensive, Patient-First Healthcare & Modern Practice Management
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          MediCare Plus was founded to provide coordinated outpatient clinical care, combining seasoned specialist physicians with transparent, real-time appointment booking workflows.
        </p>
      </div>

      {/* Mission & Philosophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#124E78] flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Healthcare Philosophy</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We believe that healthcare should be preventative, accessible, and structured around dedicated consultation time. Each appointment is allocated a minimum 30-minute block to ensure patients and physicians have adequate time to address diagnostic inquiries without rushing.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-[#124E78]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Clinic Mission</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To deliver evidence-based primary and secondary healthcare across key clinical departments, utilizing digital scheduling systems that eliminate waiting room friction and safeguard patient scheduling integrity.
          </p>
        </div>
      </div>

      {/* Facilities & Infrastructure */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Facility Infrastructure</p>
            <h2 className="text-2xl font-bold text-slate-900">Modern Clinical Suites & Diagnostic Wing</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Located in the central Metro Health District, our multi-story clinic houses fully equipped consultation suites, private patient examination areas, an on-site sample collection laboratory, and a dedicated pediatric waiting lounge.
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Specialized cardiovascular diagnostics and resting ECG facilities</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Dedicated pediatric examination rooms with family amenities</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Private orthopedic evaluation suite with rehabilitation consultation space</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>HEPA air-filtered clinical consultation environments</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100">
            <ImageWithFallback
              src="/images/clinic_facility_suite.jpg"
              alt="MediCare Plus Clinical Suites"
              fallbackType="facility"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Quick Team CTA */}
      <div className="bg-[#124E78] text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Meet Our Board-Certified Medical Staff</h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Our physicians bring extensive clinical experience from top academic medical centers across North America.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('doctors')}
            className="px-5 py-2.5 bg-white text-[#124E78] text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Explore Directory
          </button>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Portfolio Demo Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 text-center">
        <p className="font-semibold text-slate-700">Portfolio Demonstration Notice</p>
        <p className="mt-0.5">
          MediCare Plus is an architectural SaaS software demonstration created to showcase multi-role clinic operations and appointment scheduling capabilities. All staff profiles, clinic descriptions, and records are realistic fictional illustrations.
        </p>
      </div>
    </div>
  );
};
