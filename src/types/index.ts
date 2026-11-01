export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DoctorSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMinutes: number; // 30
  lunchBreakStart?: string; // "13:00"
  lunchBreakEnd?: string;   // "14:00"
}

export interface Doctor {
  id: string;
  userId?: string;
  name: string;
  specialization: string;
  qualifications: string;
  experience: number; // in years
  consultationFee: number;
  biography: string;
  photoUrl: string;
  clinicRoom: string;
  active: boolean;
  schedule: DoctorSchedule[];
  rating?: number;
  reviewCount?: number;
}

export interface MedicalService {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  baseFee: number;
  iconName: string;
  doctorSpecialty: string;
  active: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  bookingReference: string; // e.g., "MCP-2026-8941"
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  serviceId: string;
  serviceName: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "09:30"
  durationMinutes: number;
  fee: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClinicSettings {
  id: string;
  clinicName: string;
  tagline: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  timezone: string;
  defaultSlotDurationMinutes: number;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

export interface AdminStats {
  totalAppointments: number;
  todayAppointments: number;
  activeDoctors: number;
  registeredPatients: number;
  pendingAppointments: number;
  completedAppointments: number;
  monthlyRevenue: number;
  statusDistribution: { name: string; count: number; color: string }[];
  appointmentsByDepartment: { department: string; count: number }[];
  weeklyActivity: { day: string; bookings: number; completed: number }[];
  recentBookings: Appointment[];
}
