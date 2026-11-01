import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { UserCheck, Stethoscope, ShieldCheck, ClipboardList, Info } from 'lucide-react';

export const DemoBanner: React.FC<{ onNavigateToDashboard: () => void }> = ({ onNavigateToDashboard }) => {
  const { user, role, switchDemoRole } = useAuth();

  const roles: { id: UserRole; label: string; name: string; icon: any }[] = [
    { id: 'patient', label: 'Patient View', name: 'James Wilson', icon: UserCheck },
    { id: 'doctor', label: 'Doctor View', name: 'Dr. Sarah Jenkins', icon: Stethoscope },
    { id: 'receptionist', label: 'Receptionist View', name: 'Jessica Vance', icon: ClipboardList },
    { id: 'admin', label: 'Admin View', name: 'Dr. Arthur Sterling', icon: ShieldCheck },
  ];

  return (
    <div className="bg-[#124E78] text-white text-xs py-1.5 px-4 border-b border-blue-900/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-blue-100">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="font-medium text-white">Healthcare SaaS Demonstration</span>
          <span className="hidden sm:inline text-blue-300">·</span>
          <span className="hidden sm:inline text-blue-200">Simulated Clinic Environment</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-blue-300 mr-1 hidden md:inline">Switch Role:</span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  switchDemoRole(r.id);
                  onNavigateToDashboard();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-xs font-semibold'
                    : 'bg-blue-950/40 text-blue-200 hover:bg-blue-900/60 hover:text-white'
                }`}
                title={`Switch to ${r.label} (${r.name})`}
              >
                <Icon className="w-3 h-3" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
