import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { Doctor } from '../types/index.ts';
import {
  Search,
  Filter,
  Stethoscope,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  ChevronRight,
  Star,
  RotateCcw,
} from 'lucide-react';
import { ImageWithFallback } from '../components/common/ImageWithFallback.tsx';

interface FindDoctorsProps {
  onSelectDoctor: (doctorId: string) => void;
  onOpenBooking: (doctorId: string) => void;
}

export const FindDoctors: React.FC<FindDoctorsProps> = ({
  onSelectDoctor,
  onOpenBooking,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [maxFee, setMaxFee] = useState<number>(200);
  const [selectedDay, setSelectedDay] = useState<number>(-1); // -1 = all

  useEffect(() => {
    setLoading(true);
    api.getDoctors({
      specialization: selectedSpecialty,
      search,
      maxFee,
    })
      .then((data) => {
        setDoctors(data);
      })
      .catch((err) => {
        setError('Failed to load doctor directory: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedSpecialty, search, maxFee]);

  // Client-side day filtering if active
  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDay === -1) return true;
    return doc.schedule.some((s) => s.dayOfWeek === selectedDay);
  });

  const specialties = [
    'All',
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'General Consultation',
    'Diagnostic Consultation',
    'Dental Care',
  ];

  const daysOfWeek = [
    { label: 'All Days', val: -1 },
    { label: 'Mon', val: 1 },
    { label: 'Tue', val: 2 },
    { label: 'Wed', val: 3 },
    { label: 'Thu', val: 4 },
    { label: 'Fri', val: 5 },
    { label: 'Sat', val: 6 },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSpecialty('All');
    setMaxFee(200);
    setSelectedDay(-1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Specialist Directory</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Find Trusted Doctors</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Search accredited medical specialists, check available clinic consultation slots, and book directly.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name or qualification..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] text-slate-700 bg-white"
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'All' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Range Slider */}
          <div className="md:col-span-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Max Fee:</span>
                <span className="font-bold text-slate-900 tabular-nums">${maxFee}</span>
              </div>
              <input
                type="range"
                min="100"
                max="200"
                step="10"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-full accent-[#124E78] cursor-pointer"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Working Day Filter Pill-less buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-2">Available On:</span>
          {daysOfWeek.map((d) => (
            <button
              key={d.val}
              onClick={() => setSelectedDay(d.val)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDay === d.val
                  ? 'bg-[#124E78] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> available physicians
        </span>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 space-y-2">
          <div className="w-6 h-6 border-2 border-[#124E78] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading directory of medical specialists...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center p-6 space-y-3">
          <p className="text-sm font-bold text-slate-800">No doctors match your filter criteria.</p>
          <p className="text-xs text-slate-500">Try broadening your search term or adjusting the fee slider.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#124E78] text-white text-xs font-semibold rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="aspect-square bg-slate-100 overflow-hidden relative border-b border-slate-100">
                  <ImageWithFallback
                    src={doc.photoUrl}
                    alt={doc.name}
                    fallbackType="doctor"
                    doctorSpecialty={doc.specialization}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold text-[#124E78] shadow-xs tabular-nums">
                    ${doc.consultationFee}
                  </div>
                  {doc.rating && (
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-300">({doc.reviewCount})</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-teal-700">{doc.specialization}</span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{doc.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{doc.qualifications}</p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.experience} years clinical experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.clinicRoom}</span>
                    </div>
                  </div>

                  {/* Schedule days summary */}
                  <div className="text-[10px] text-slate-400 pt-1">
                    Available: {doc.schedule.length > 5 ? 'Mon - Sat' : 'Mon - Fri, 09:00 - 17:00'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectDoctor(doc.id)}
                  className="py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onOpenBooking(doc.id)}
                  className="py-2 text-xs font-semibold text-white bg-[#124E78] hover:bg-[#0d3b5b] rounded-lg shadow-xs transition-colors text-center flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
