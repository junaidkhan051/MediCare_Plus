import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import type { AdminStats, Doctor, MedicalService, Appointment, ClinicSettings } from '../../types/index.ts';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  ClipboardList,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Stethoscope,
  Shield,
  Save,
  Search,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState<
    'overview' | 'doctors' | 'appointments' | 'patients' | 'services' | 'reports' | 'settings'
  >('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals for adding doctor / service
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('Cardiology');
  const [newDoctorFee, setNewDoctorFee] = useState(150);
  const [newDoctorExp, setNewDoctorExp] = useState(8);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceFee, setNewServiceFee] = useState(120);
  const [newServiceDept, setNewServiceDept] = useState('General Consultation');

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminStats(),
      api.getDoctors(),
      api.getServices(),
      api.getAppointments(),
      api.getPatients(),
      api.getSettings(),
    ])
      .then(([st, docs, srvs, apts, pts, setts]) => {
        setStats(st);
        setDoctors(docs);
        setServices(srvs);
        setAppointments(apts);
        setPatients(pts);
        setSettings(setts);
      })
      .catch((err) => {
        console.error('Error loading admin portal data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDoctor({
        name: newDoctorName,
        specialization: newDoctorSpecialty,
        consultationFee: newDoctorFee,
        experience: newDoctorExp,
        qualifications: 'MD, Board Certified',
      });
      setShowAddDoctorModal(false);
      setNewDoctorName('');
      setFeedback('Doctor profile created successfully.');
      loadAllData();
    } catch (err: any) {
      alert('Error creating doctor: ' + err.message);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createService({
        name: newServiceName,
        description: newServiceDesc,
        baseFee: newServiceFee,
        doctorSpecialty: newServiceDept,
        durationMinutes: 30,
      });
      setShowAddServiceModal(false);
      setNewServiceName('');
      setNewServiceDesc('');
      setFeedback('Medical service created successfully.');
      loadAllData();
    } catch (err: any) {
      alert('Error creating service: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      setFeedback('Clinic operational settings saved.');
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-0.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            MediCare Plus Clinic Operations
          </h1>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-[#124E78] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-teal-600 hover:text-teal-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. OVERVIEW VIEW */}
      {activeNav === 'overview' && (
        <div className="space-y-6">
          {/* 6 Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Total Bookings</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {stats?.totalAppointments ?? 0}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Today's Visits</span>
              <span className="text-2xl font-bold text-[#124E78] tabular-nums">
                {stats?.todayAppointments ?? 0}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Active Doctors</span>
              <span className="text-2xl font-bold text-teal-700 tabular-nums">
                {stats?.activeDoctors ?? 0}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Registered Patients</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {stats?.registeredPatients ?? 0}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Pending Review</span>
              <span className="text-2xl font-bold text-amber-600 tabular-nums">
                {stats?.pendingAppointments ?? 0}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Completed</span>
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                {stats?.completedAppointments ?? 0}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Activity Line/Area */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weekly Booking Activity</h3>
                  <p className="text-xs text-slate-400">Total appointments booked and completed this week</p>
                </div>
                <div className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real Schedule Queries</span>
                </div>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.weeklyActivity || []}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#124E78" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#124E78" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15B8A6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#15B8A6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      name="Appointments Scheduled"
                      stroke="#124E78"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBookings)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed Visits"
                      stroke="#15B8A6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Breakdown Donut */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Booking Status Ratio</h3>
              <p className="text-xs text-slate-400">Current state across active records</p>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {stats?.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                {stats?.statusDistribution.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-600">{s.name}:</span>
                    <strong className="text-slate-800 tabular-nums">{s.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Appointments Quick Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Booking Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Ref</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Date & Slot</th>
                    <th className="py-2.5 px-3">Fee</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{b.patientName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{b.doctorName}</td>
                      <td className="py-2.5 px-3 tabular-nums">{b.date} {b.timeSlot}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">${b.fee}</td>
                      <td className="py-2.5 px-3 capitalize font-semibold">{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCTORS MANAGEMENT VIEW */}
      {activeNav === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Physician Roster & Schedules</h2>
              <p className="text-xs text-slate-500">Manage clinical staff profiles, consultation fees, and active statuses.</p>
            </div>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Physician</th>
                    <th className="py-3 px-4">Specialty</th>
                    <th className="py-3 px-4">Qualifications</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{doc.name}</td>
                      <td className="py-3.5 px-4 text-teal-700 font-semibold">{doc.specialization}</td>
                      <td className="py-3.5 px-4 text-slate-500">{doc.qualifications}</td>
                      <td className="py-3.5 px-4 tabular-nums">{doc.experience} years</td>
                      <td className="py-3.5 px-4 font-bold text-[#124E78] tabular-nums">${doc.consultationFee}</td>
                      <td className="py-3.5 px-4 text-slate-500">{doc.clinicRoom}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            doc.active ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {doc.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={async () => {
                            await api.updateDoctor(doc.id, { active: !doc.active });
                            loadAllData();
                          }}
                          className="text-[11px] font-medium text-slate-600 hover:text-slate-900"
                        >
                          {doc.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS VIEW */}
      {activeNav === 'appointments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clinic Appointment Records</h2>
            <p className="text-xs text-slate-500">Authorized clinic-wide consultation schedule and status controls.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {apt.bookingReference}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <p className="font-semibold text-slate-800">{apt.date}</p>
                        <p className="text-slate-500 text-[11px]">{apt.timeSlot}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{apt.patientName}</p>
                        <p className="text-slate-500 text-[11px]">{apt.patientEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{apt.doctorName}</td>
                      <td className="py-3.5 px-4 text-teal-700">{apt.serviceName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">${apt.fee}</td>
                      <td className="py-3.5 px-4 capitalize font-semibold">{apt.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PATIENTS VIEW */}
      {activeNav === 'patients' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registered Patient Records</h2>
            <p className="text-xs text-slate-500">Permitted administrative patient contact info and visit histories.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Total Consultations</th>
                    <th className="py-3 px-4">Last Visit</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((pt) => (
                    <tr key={pt.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{pt.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{pt.email}</td>
                      <td className="py-3.5 px-4 text-slate-600">{pt.phone || '—'}</td>
                      <td className="py-3.5 px-4 font-bold text-[#124E78] tabular-nums">{pt.totalVisits} visits</td>
                      <td className="py-3.5 px-4 tabular-nums">{pt.lastVisit || 'None recorded'}</td>
                      <td className="py-3.5 px-4 text-slate-400 tabular-nums">{pt.createdAt ? pt.createdAt.split('T')[0] : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SERVICES VIEW */}
      {activeNav === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Medical Services Catalog</h2>
              <p className="text-xs text-slate-500">Configure clinic offerings, base consultation fees, and departments.</p>
            </div>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="px-4 py-2 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Department Specialty</th>
                    <th className="py-3 px-4">Standard Duration</th>
                    <th className="py-3 px-4">Base Fee</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{srv.name}</td>
                      <td className="py-3.5 px-4 text-teal-700 font-semibold">{srv.doctorSpecialty}</td>
                      <td className="py-3.5 px-4 tabular-nums">{srv.durationMinutes} mins</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">${srv.baseFee}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">{srv.description}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. REPORTS & ANALYTICS VIEW */}
      {activeNav === 'reports' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clinic Analytics & Department Volume</h2>
            <p className="text-xs text-slate-500">Data visualizations powered by live database booking metrics.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Consultations by Department</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.appointmentsByDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="department" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="count" name="Patient Consultations" fill="#124E78" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Activity Comparison */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Weekly Booking Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.weeklyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '11px',
                        border: 'none',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="bookings" name="Scheduled" fill="#124E78" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#15B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CLINIC SETTINGS VIEW */}
      {activeNav === 'settings' && settings && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clinic Operational Settings</h2>
            <p className="text-xs text-slate-500">Configure global facility parameters, consultation intervals, and operating schedule.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Timezone</label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Slot Duration (Minutes)</label>
                <input
                  type="number"
                  value={settings.defaultSlotDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, defaultSlotDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Add New Doctor to Staff</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Julian Foster"
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                <select
                  value={newDoctorSpecialty}
                  onChange={(e) => setNewDoctorSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="Diagnostic Consultation">Diagnostic Consultation</option>
                  <option value="Dental Care">Dental Care</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    required
                    value={newDoctorFee}
                    onChange={(e) => setNewDoctorFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={newDoctorExp}
                    onChange={(e) => setNewDoctorExp(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#124E78] text-white font-semibold rounded-lg"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Add Medical Service</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Allergy Panel & Sensitivity Screen"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Specialty</label>
                <select
                  value={newServiceDept}
                  onChange={(e) => setNewServiceDept(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="Diagnostic Consultation">Diagnostic Consultation</option>
                  <option value="Dental Care">Dental Care</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Consultation Fee ($)</label>
                <input
                  type="number"
                  required
                  value={newServiceFee}
                  onChange={(e) => setNewServiceFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe consultation scope and procedure details..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#124E78] text-white font-semibold rounded-lg"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
