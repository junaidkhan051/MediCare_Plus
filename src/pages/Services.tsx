import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { MedicalService, Doctor } from '../types/index.ts';
import {
  Stethoscope,
  HeartPulse,
  Activity,
  Baby,
  Sparkles,
  Smile,
  FileSearch,
  Calendar,
  Clock,
  DollarSign,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface ServicesProps {
  onOpenBooking: (doctorId?: string) => void;
  onSelectDoctor: (doctorId: string) => void;
}

export const Services: React.FC<ServicesProps> = ({
  onOpenBooking,
  onSelectDoctor,
}) => {
  const [services, setServices] = useState<MedicalService[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getServices(), api.getDoctors()])
      .then(([srvList, docList]) => {
        setServices(srvList);
        setDoctors(docList);
      })
      .catch((err) => {
        console.error('Error loading services:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return HeartPulse;
      case 'Activity':
        return Activity;
      case 'Baby':
        return Baby;
      case 'Sparkles':
        return Sparkles;
      case 'Smile':
        return Smile;
      case 'FileSearch':
        return FileSearch;
      default:
        return Stethoscope;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Clinical Specialties</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Our Medical Services</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Comprehensive primary and specialized healthcare delivered by board-certified physicians using state-of-the-art diagnostic facilities.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading clinic service menu...</div>
      ) : (
        <div className="space-y-6">
          {services.map((srv) => {
            const Icon = getServiceIcon(srv.iconName);
            const matchedDocs = doctors.filter(
              (d) => d.specialization.toLowerCase() === srv.doctorSpecialty.toLowerCase()
            );

            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-teal-500/80 transition-all space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#124E78] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">{srv.category}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500 tabular-nums">{srv.durationMinutes} min consultation</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{srv.name}</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                        {srv.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Standard Fee</span>
                    <span className="text-xl font-extrabold text-[#124E78] tabular-nums">${srv.baseFee}</span>
                    <div className="mt-2">
                      <button
                        onClick={() => onOpenBooking(matchedDocs[0]?.id)}
                        className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Associated Doctors Section */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-3">
                    Available Specialists in {srv.name}:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {matchedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white hover:border-teal-400 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {doc.photoUrl ? (
                              <img
                                src={doc.photoUrl}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Stethoscope className="w-4 h-4 text-teal-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                            <p className="text-[11px] text-slate-500 tabular-nums">{doc.experience} yrs exp</p>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectDoctor(doc.id)}
                          className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 whitespace-nowrap"
                        >
                          Profile →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
