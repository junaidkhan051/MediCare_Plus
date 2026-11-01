import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, hashPassword, verifyPassword } from './server/db.ts';
import type { Appointment, Doctor, MedicalService, User, AdminStats } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Simple token simulation using user ID header
// Format: Bearer usr-...
function getUserFromRequest(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const user = db.users.find((u) => u.id === token || u.email === token);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser as User;
}

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token: user.id,
    message: 'Login successful.',
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser: any = {
    id: `usr-pat-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'patient',
    passwordHash: hashPassword(password),
    phone: phone?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({
    user: safeUser,
    token: newUser.id,
    message: 'Registration successful.',
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  return res.json({ user });
});

app.post('/api/auth/demo-switch', (req, res) => {
  const { role, doctorId } = req.body;
  let targetUser;

  if (role === 'doctor') {
    if (doctorId) {
      targetUser = db.users.find((u) => {
        const doc = db.doctors.find((d) => d.id === doctorId);
        return doc && (d_user(doc, u));
      }) || db.users.find((u) => u.role === 'doctor');
    } else {
      targetUser = db.users.find((u) => u.role === 'doctor');
    }
  } else {
    targetUser = db.users.find((u) => u.role === role);
  }

  function d_user(doc: Doctor, u: any) {
    return doc.userId === u.id || (doc.name === u.name);
  }

  if (!targetUser) {
    return res.status(404).json({ error: `Demo account for role ${role} not found.` });
  }

  const { passwordHash: _, ...safeUser } = targetUser;
  return res.json({
    user: safeUser,
    token: targetUser.id,
    message: `Switched to demo ${role} account.`,
  });
});

/* ==========================================================================
   DOCTORS ENDPOINTS
   ========================================================================== */

app.get('/api/doctors', (req, res) => {
  const { specialization, search, maxFee } = req.query;
  let results = [...db.doctors];

  if (specialization && specialization !== 'All') {
    results = results.filter(
      (d) => d.specialization.toLowerCase() === String(specialization).toLowerCase()
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.qualifications.toLowerCase().includes(q)
    );
  }

  if (maxFee) {
    const fee = Number(maxFee);
    if (!isNaN(fee) && fee > 0) {
      results = results.filter((d) => d.consultationFee <= fee);
    }
  }

  return res.json(results);
});

app.get('/api/doctors/:id', (req, res) => {
  const doc = db.doctors.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found.' });
  }
  return res.json(doc);
});

app.get('/api/doctors/:id/availability', (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'A date parameter (YYYY-MM-DD) is required.' });
  }

  const availability = db.getDoctorAvailabilityForDate(req.params.id, date);
  return res.json(availability);
});

app.post('/api/doctors', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin role required.' });
  }

  const { name, specialization, qualifications, experience, consultationFee, biography, clinicRoom } = req.body;
  if (!name || !specialization || !consultationFee) {
    return res.status(400).json({ error: 'Name, specialization, and consultationFee are required.' });
  }

  const newDoc: Doctor = {
    id: `doc-${Date.now()}`,
    name,
    specialization,
    qualifications: qualifications || 'MD',
    experience: Number(experience) || 5,
    consultationFee: Number(consultationFee),
    biography: biography || 'Experienced clinical practitioner dedicated to high-standard patient care.',
    photoUrl: '',
    clinicRoom: clinicRoom || 'Suite 201',
    active: true,
    schedule: [1, 2, 3, 4, 5].map((d) => ({
      dayOfWeek: d,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      lunchBreakStart: '13:00',
      lunchBreakEnd: '14:00',
    })),
    rating: 4.8,
    reviewCount: 1,
  };

  db.doctors.push(newDoc);
  return res.status(201).json(newDoc);
});

app.put('/api/doctors/:id', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'doctor')) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const idx = db.doctors.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Doctor not found.' });
  }

  const updated: Doctor = {
    ...db.doctors[idx],
    ...req.body,
    id: db.doctors[idx].id, // protect ID
  };

  db.doctors[idx] = updated;
  return res.json(updated);
});

/* ==========================================================================
   SERVICES ENDPOINTS
   ========================================================================== */

app.get('/api/services', (_req, res) => {
  return res.json(db.services);
});

app.post('/api/services', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required.' });
  }

  const { name, description, category, durationMinutes, baseFee, doctorSpecialty, iconName } = req.body;
  if (!name || !description || !baseFee) {
    return res.status(400).json({ error: 'Missing required service fields.' });
  }

  const newService: MedicalService = {
    id: `srv-${Date.now()}`,
    name,
    description,
    category: category || 'General',
    durationMinutes: Number(durationMinutes) || 30,
    baseFee: Number(baseFee),
    doctorSpecialty: doctorSpecialty || 'General Consultation',
    iconName: iconName || 'Stethoscope',
    active: true,
  };

  db.services.push(newService);
  return res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required.' });
  }

  const idx = db.services.findIndex((s) => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  db.services[idx] = { ...db.services[idx], ...req.body, id: db.services[idx].id };
  return res.json(db.services[idx]);
});

/* ==========================================================================
   APPOINTMENTS ENDPOINTS (Scheduling Engine & Double Booking Prevention)
   ========================================================================== */

app.get('/api/appointments', (req, res) => {
  const user = getUserFromRequest(req);
  const { date, doctorId, status, search } = req.query;

  let list = [...db.appointments];

  // RBAC Access checks
  if (user) {
    if (user.role === 'patient') {
      list = list.filter((a) => a.patientId === user.id || a.patientEmail.toLowerCase() === user.email.toLowerCase());
    } else if (user.role === 'doctor') {
      // Find doctor profile associated with this user
      const doc = db.doctors.find((d) => d.userId === user.id || d.name === user.name);
      if (doc) {
        list = list.filter((a) => a.doctorId === doc.id);
      }
    }
    // receptionists & admins see all appointments
  }

  if (date) {
    list = list.filter((a) => a.date === String(date));
  }

  if (doctorId && doctorId !== 'all') {
    list = list.filter((a) => a.doctorId === String(doctorId));
  }

  if (status && status !== 'all') {
    list = list.filter((a) => a.status === String(status));
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (a) =>
        a.bookingReference.toLowerCase().includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.patientPhone.toLowerCase().includes(q)
    );
  }

  // Sort by date & time ascending
  list.sort((a, b) => `${a.date} ${a.timeSlot}`.localeCompare(`${b.date} ${b.timeSlot}`));

  return res.json(list);
});

app.post('/api/appointments', (req, res) => {
  const {
    doctorId,
    serviceId,
    date,
    timeSlot,
    patientName,
    patientEmail,
    patientPhone,
    reason,
  } = req.body;

  if (!doctorId || !date || !timeSlot || !patientName || !patientEmail || !patientPhone) {
    return res.status(400).json({ error: 'All appointment details and patient contact fields are required.' });
  }

  // 1. Validate date not in the past
  const appointmentDate = new Date(`${date}T${timeSlot}:00`);
  const now = new Date();
  if (appointmentDate < now) {
    return res.status(400).json({ error: 'Cannot book appointments in the past.' });
  }

  // 2. Validate doctor exists
  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor || !doctor.active) {
    return res.status(404).json({ error: 'Selected doctor is not available.' });
  }

  // 3. ENFORCE DOUBLE-BOOKING PREVENTION AT BACKEND (CRITICAL)
  const isAvailable = db.isSlotAvailable(doctorId, date, timeSlot);
  if (!isAvailable) {
    return res.status(409).json({
      error: 'Conflict: This time slot was just booked by another patient. Please choose an alternative slot.',
      code: 'SLOT_UNAVAILABLE',
    });
  }

  // Find service info
  const service = db.services.find((s) => s.id === serviceId) || {
    id: 'general',
    name: 'General Consultation',
    baseFee: doctor.consultationFee,
    durationMinutes: 30,
  };

  const currentUser = getUserFromRequest(req);
  const patientId = currentUser ? currentUser.id : `usr-guest-${Date.now()}`;

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    bookingReference: db.generateBookingReference(),
    patientId,
    patientName: patientName.trim(),
    patientEmail: patientEmail.trim().toLowerCase(),
    patientPhone: patientPhone.trim(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialization,
    serviceId: service.id,
    serviceName: service.name,
    date,
    timeSlot,
    durationMinutes: service.durationMinutes || 30,
    fee: doctor.consultationFee,
    status: 'confirmed',
    reason: reason?.trim() || 'General health consultation.',
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(newAppointment);

  return res.status(201).json({
    appointment: newAppointment,
    message: 'Appointment successfully confirmed and scheduled.',
  });
});

app.get('/api/appointments/:id', (req, res) => {
  const apt = db.appointments.find((a) => a.id === req.params.id || a.bookingReference === req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }
  return res.json(apt);
});

app.patch('/api/appointments/:id/status', (req, res) => {
  const { status, notes } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid appointment status.' });
  }

  const idx = db.appointments.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  db.appointments[idx].status = status;
  if (notes) {
    db.appointments[idx].notes = notes;
  }
  db.appointments[idx].updatedAt = new Date().toISOString();

  return res.json({
    appointment: db.appointments[idx],
    message: `Appointment status updated to ${status}.`,
  });
});

app.patch('/api/appointments/:id/reschedule', (req, res) => {
  const { date, timeSlot } = req.body;
  if (!date || !timeSlot) {
    return res.status(400).json({ error: 'New date and timeSlot are required.' });
  }

  const idx = db.appointments.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const currentApt = db.appointments[idx];

  // Prevent past dates
  const newDateObj = new Date(`${date}T${timeSlot}:00`);
  if (newDateObj < new Date()) {
    return res.status(400).json({ error: 'Cannot reschedule to a past date/time.' });
  }

  // Check collision
  const isAvailable = db.isSlotAvailable(currentApt.doctorId, date, timeSlot, currentApt.id);
  if (!isAvailable) {
    return res.status(409).json({ error: 'Selected new slot is already occupied. Please pick another slot.' });
  }

  currentApt.date = date;
  currentApt.timeSlot = timeSlot;
  currentApt.status = 'confirmed';
  currentApt.updatedAt = new Date().toISOString();

  return res.json({
    appointment: currentApt,
    message: 'Appointment successfully rescheduled.',
  });
});

/* ==========================================================================
   PATIENTS ENDPOINT (Admin & Receptionist)
   ========================================================================== */

app.get('/api/patients', (req, res) => {
  const user = getUserFromRequest(req);
  if (user && user.role === 'patient') {
    return res.status(403).json({ error: 'Access restricted to medical staff and administration.' });
  }

  // Aggregate patients from users with role 'patient' + appointments
  const patientMap = new Map<string, any>();

  db.users.filter((u) => u.role === 'patient').forEach((u) => {
    patientMap.set(u.id, {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      totalVisits: 0,
      lastVisit: null,
      createdAt: u.createdAt,
    });
  });

  db.appointments.forEach((apt) => {
    const existing = patientMap.get(apt.patientId);
    if (existing) {
      existing.totalVisits += 1;
      if (!existing.lastVisit || apt.date > existing.lastVisit) {
        existing.lastVisit = apt.date;
      }
    } else {
      patientMap.set(apt.patientId, {
        id: apt.patientId,
        name: apt.patientName,
        email: apt.patientEmail,
        phone: apt.patientPhone,
        totalVisits: 1,
        lastVisit: apt.date,
        createdAt: apt.createdAt,
      });
    }
  });

  return res.json(Array.from(patientMap.values()));
});

/* ==========================================================================
   ADMIN ANALYTICS & STATS
   ========================================================================== */

app.get('/api/admin/stats', (_req, res) => {
  const totalAppointments = db.appointments.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = db.appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled').length;
  const activeDoctors = db.doctors.filter((d) => d.active).length;
  const registeredPatients = db.users.filter((u) => u.role === 'patient').length;
  const pendingAppointments = db.appointments.filter((a) => a.status === 'pending').length;
  const completedAppointments = db.appointments.filter((a) => a.status === 'completed').length;

  const monthlyRevenue = db.appointments
    .filter((a) => a.status === 'completed' || a.status === 'confirmed')
    .reduce((sum, a) => sum + (a.fee || 150), 0);

  // Status breakdown
  const statusCounts: Record<string, number> = {
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };
  db.appointments.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  const statusDistribution = [
    { name: 'Confirmed', count: statusCounts.confirmed, color: '#15B8A6' },
    { name: 'Completed', count: statusCounts.completed, color: '#124E78' },
    { name: 'Pending', count: statusCounts.pending, color: '#F59E0B' },
    { name: 'Cancelled', count: statusCounts.cancelled, color: '#EF4444' },
  ];

  // By department
  const deptMap: Record<string, number> = {};
  db.appointments.forEach((a) => {
    deptMap[a.doctorSpecialty] = (deptMap[a.doctorSpecialty] || 0) + 1;
  });
  const appointmentsByDepartment = Object.entries(deptMap).map(([department, count]) => ({
    department,
    count,
  }));

  // Weekly activity
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyActivity = daysOfWeek.map((day, idx) => ({
    day,
    bookings: 4 + ((idx * 3) % 7) + (idx === 2 ? 5 : 0),
    completed: 3 + ((idx * 2) % 5),
  }));

  const recentBookings = [...db.appointments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const stats: AdminStats = {
    totalAppointments,
    todayAppointments,
    activeDoctors,
    registeredPatients,
    pendingAppointments,
    completedAppointments,
    monthlyRevenue,
    statusDistribution,
    appointmentsByDepartment,
    weeklyActivity,
    recentBookings,
  };

  return res.json(stats);
});

/* ==========================================================================
   CLINIC SETTINGS & CONTACT
   ========================================================================== */

app.get('/api/settings', (_req, res) => {
  return res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required.' });
  }

  db.settings = { ...db.settings, ...req.body, id: db.settings.id };
  return res.json(db.settings);
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const submission = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    subject: subject || 'General Medical Inquiry',
    message,
    createdAt: new Date().toISOString(),
  };

  db.contactSubmissions.push(submission);
  return res.status(201).json({
    message: 'Thank you for reaching out. A patient care coordinator will review your inquiry within 24 hours.',
    submissionId: submission.id,
  });
});

/* ==========================================================================
   VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
   ========================================================================== */

async function startServer() {
  // Always serve public images directory statically
  app.use('/images', express.static(path.resolve(__dirname, 'public/images')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dynamic import vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediCare Plus] Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[MediCare Plus] Server startup error:', err);
  process.exit(1);
});
