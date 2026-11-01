import type {
  User,
  Doctor,
  MedicalService,
  Appointment,
  ClinicSettings,
  AdminStats,
  AppointmentStatus,
} from '../types/index.ts';

const TOKEN_KEY = 'medicare_auth_token';
const USER_KEY = 'medicare_user';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setAuth(res.token, res.user);
    return res;
  },

  register: async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    authStorage.setAuth(res.token, res.user);
    return res;
  },

  demoSwitch: async (role: string, doctorId?: string) => {
    const res = await request<{ user: User; token: string; message: string }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role, doctorId }),
    });
    authStorage.setAuth(res.token, res.user);
    return res;
  },

  getMe: () => request<{ user: User }>('/api/auth/me'),

  logout: () => {
    authStorage.clearAuth();
  },

  // Doctors
  getDoctors: (params?: { specialization?: string; search?: string; maxFee?: number }) => {
    const query = new URLSearchParams();
    if (params?.specialization && params.specialization !== 'All') {
      query.set('specialization', params.specialization);
    }
    if (params?.search) query.set('search', params.search);
    if (params?.maxFee) query.set('maxFee', String(params.maxFee));
    return request<Doctor[]>(`/api/doctors?${query.toString()}`);
  },

  getDoctor: (id: string) => request<Doctor>(`/api/doctors/${id}`),

  getDoctorAvailability: (doctorId: string, date: string) =>
    request<{
      isWorkingDay: boolean;
      slots: string[];
      bookedSlots: string[];
      availableSlots: string[];
    }>(`/api/doctors/${doctorId}/availability?date=${date}`),

  createDoctor: (data: Partial<Doctor>) =>
    request<Doctor>('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDoctor: (id: string, data: Partial<Doctor>) =>
    request<Doctor>(`/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Services
  getServices: () => request<MedicalService[]>('/api/services'),

  createService: (data: Partial<MedicalService>) =>
    request<MedicalService>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: Partial<MedicalService>) =>
    request<MedicalService>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Appointments
  getAppointments: (params?: { date?: string; doctorId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.doctorId) query.set('doctorId', params.doctorId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return request<Appointment[]>(`/api/appointments?${query.toString()}`);
  },

  getAppointment: (id: string) => request<Appointment>(`/api/appointments/${id}`),

  createAppointment: (payload: {
    doctorId: string;
    serviceId?: string;
    date: string;
    timeSlot: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    reason?: string;
  }) =>
    request<{ appointment: Appointment; message: string }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAppointmentStatus: (id: string, status: AppointmentStatus, notes?: string) =>
    request<{ appointment: Appointment; message: string }>(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  rescheduleAppointment: (id: string, date: string, timeSlot: string) =>
    request<{ appointment: Appointment; message: string }>(`/api/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ date, timeSlot }),
    }),

  // Patients (Admin/Receptionist)
  getPatients: () => request<any[]>('/api/patients'),

  // Admin stats
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),

  // Settings
  getSettings: () => request<ClinicSettings>('/api/settings'),

  updateSettings: (settings: Partial<ClinicSettings>) =>
    request<ClinicSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Contact
  submitContact: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request<{ message: string; submissionId: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
