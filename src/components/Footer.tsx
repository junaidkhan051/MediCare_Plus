import React from 'react';
import { Phone, Mail, MapPin, Clock, ShieldAlert, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Clinic Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-900 flex items-center justify-center font-bold text-base">
                M+
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MediCare<span className="text-teal-400">Plus</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Specialized multi-disciplinary medical clinic providing patient-centered primary and specialist care with modern scheduling workflows.
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="text-teal-400">●</span>
              <span>Accredited Outpatient Health Facility</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Clinic Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-teal-400 transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  Find Doctors Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-teal-400 transition-colors">
                  Clinical Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-teal-400 transition-colors">
                  About Clinic & Facility
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-teal-400 transition-colors">
                  Appointments & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinic Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Consultation Hours</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Monday - Friday</p>
                  <p className="text-slate-400">08:00 AM - 08:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Saturday</p>
                  <p className="text-slate-400">09:00 AM - 05:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Sunday (Urgent Care)</p>
                  <p className="text-slate-400">10:00 AM - 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact & Location</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>450 Healthcare Boulevard, Suite 300, Metro Health District</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+1 (800) 456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>contact@medicareplus-clinic.com</span>
              </div>

              {/* Emergency Box */}
              <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-rose-100">Medical Emergencies</span>
                  <span>For life-threatening acute symptoms, call 911 immediately or visit nearest ER.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Portfolio Demo Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>© {new Date().getFullYear()} MediCare Plus Healthcare Systems. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-center">
            <Heart className="w-3.5 h-3.5 text-teal-400" />
            <span>Commercial Healthcare SaaS Demonstration Portfolio Project · Never uses real patient information.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
