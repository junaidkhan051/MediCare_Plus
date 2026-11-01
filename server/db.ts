import crypto from 'node:crypto';
import type { User, Doctor, MedicalService, Appointment, ClinicSettings, AdminStats } from '../src/types/index.ts';

// Password hashing using Node crypto PBKDF2
export function hashPassword(password: string, salt = 'medicare_plus_salt_2026'): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export interface UserRecord extends User {
  passwordHash: string;
}

// In-memory relational store with seed data
class DatabaseStore {
  users: UserRecord[] = [];
  doctors: Doctor[] = [];
  services: MedicalService[] = [];
  appointments: Appointment[] = [];
  contactSubmissions: Array<{ id: string; name: string; email: string; phone: string; subject: string; message: string; createdAt: string }> = [];
  settings: ClinicSettings = {
    id: 'clinic-default',
    clinicName: 'MediCare Plus Specialist Clinic',
    tagline: 'Your Health, Our Priority.',
    address: '450 Healthcare Boulevard, Suite 300, Metro Health District',
    phone: '+1 (800) 456-7890',
    emergencyPhone: '+1 (800) 911-CARE',
    email: 'appointments@medicareplus-clinic.com',
    timezone: 'America/New_York (EST)',
    defaultSlotDurationMinutes: 30,
    openingHours: {
      weekdays: '08:00 AM - 08:00 PM',
      saturday: '09:00 AM - 05:00 PM',
      sunday: '10:00 AM - 02:00 PM (Emergency & Urgent)',
    },
  };

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Users
    const defaultUsers: UserRecord[] = [
      {
        id: 'usr-admin-1',
        name: 'Dr. Arthur Sterling',
        email: 'admin@medicareplus.com',
        role: 'admin',
        passwordHash: hashPassword('Admin123!'),
        phone: '+1 (800) 456-7891',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'usr-doc-1',
        name: 'Dr. Sarah Jenkins',
        email: 'dr.sarah@medicareplus.com',
        role: 'doctor',
        passwordHash: hashPassword('Doctor123!'),
        phone: '+1 (800) 456-7892',
        createdAt: '2026-01-12T09:00:00.000Z',
      },
      {
        id: 'usr-doc-2',
        name: 'Dr. Marcus Vance',
        email: 'dr.marcus@medicareplus.com',
        role: 'doctor',
        passwordHash: hashPassword('Doctor123!'),
        phone: '+1 (800) 456-7893',
        createdAt: '2026-01-14T09:00:00.000Z',
      },
      {
        id: 'usr-rec-1',
        name: 'Jessica Vance',
        email: 'reception@medicareplus.com',
        role: 'receptionist',
        passwordHash: hashPassword('Reception123!'),
        phone: '+1 (800) 456-7894',
        createdAt: '2026-02-01T08:30:00.000Z',
      },
      {
        id: 'usr-pat-1',
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        role: 'patient',
        passwordHash: hashPassword('Patient123!'),
        phone: '+1 (555) 234-5678',
        createdAt: '2026-02-15T10:00:00.000Z',
      },
      {
        id: 'usr-pat-2',
        name: 'Emily Chen',
        email: 'emily.chen@example.com',
        role: 'patient',
        passwordHash: hashPassword('Patient123!'),
        phone: '+1 (555) 345-6789',
        createdAt: '2026-03-01T11:20:00.000Z',
      },
    ];
    this.users = defaultUsers;

    // Standard weekday schedule: Mon-Fri 09:00 - 17:00 (with lunch 13:00 - 14:00)
    const weekdaySchedule = [1, 2, 3, 4, 5].map((day) => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      lunchBreakStart: '13:00',
      lunchBreakEnd: '14:00',
    }));

    // Weekend availability variant (Mon, Wed, Fri, Sat)
    const alternateSchedule = [1, 3, 5, 6].map((day) => ({
      dayOfWeek: day,
      startTime: day === 6 ? '10:00' : '09:00',
      endTime: day === 6 ? '15:00' : '17:00',
      slotDurationMinutes: 30,
      lunchBreakStart: '13:00',
      lunchBreakEnd: '14:00',
    }));

    // 2. Seed 8 Fictional Doctors across multiple specialties
    this.doctors = [
      {
        id: 'doc-1',
        userId: 'usr-doc-1',
        name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        qualifications: 'MD, FACC, Harvard Medical School',
        experience: 14,
        consultationFee: 160,
        biography: 'Dr. Sarah Jenkins is an experienced clinical cardiologist specializing in preventative heart care, cardiovascular risk assessment, and non-invasive hypertension management. She believes in patient-centered diagnostic care.',
        photoUrl: '/images/doctor_sarah_jenkins.jpg',
        clinicRoom: 'Suite 204 - Cardiovascular Wing',
        active: true,
        schedule: weekdaySchedule,
        rating: 4.9,
        reviewCount: 142,
      },
      {
        id: 'doc-2',
        userId: 'usr-doc-2',
        name: 'Dr. Marcus Vance',
        specialization: 'Orthopedics',
        qualifications: 'MD, FAAOS, Johns Hopkins University',
        experience: 16,
        consultationFee: 175,
        biography: 'Dr. Marcus Vance is a board-certified orthopedic specialist focusing on sports injuries, joint rehabilitation, and musculoskeletal preservation. He works closely with patients on functional recovery plans.',
        photoUrl: '/images/doctor_marcus_vance.jpg',
        clinicRoom: 'Suite 108 - Orthopedic Care Center',
        active: true,
        schedule: weekdaySchedule,
        rating: 4.8,
        reviewCount: 98,
      },
      {
        id: 'doc-3',
        name: 'Dr. Elena Rodriguez',
        specialization: 'Pediatrics',
        qualifications: 'MD, FAAP, Stanford School of Medicine',
        experience: 11,
        consultationFee: 130,
        biography: 'Dr. Elena Rodriguez provides compassionate pediatric medicine from infancy through adolescence, focusing on developmental milestones, preventative pediatric screening, and gentle family consultations.',
        photoUrl: '/images/doctor_elena_rodriguez.jpg',
        clinicRoom: 'Suite 302 - Pediatric Center',
        active: true,
        schedule: alternateSchedule,
        rating: 4.95,
        reviewCount: 178,
      },
      {
        id: 'doc-4',
        name: 'Dr. David Kim',
        specialization: 'General Consultation',
        qualifications: 'MD, Internal Medicine, Columbia University',
        experience: 12,
        consultationFee: 110,
        biography: 'Dr. David Kim specializes in primary care, comprehensive health screenings, and preventative chronic disease prevention. Known for thorough physical evaluations and individualized lifestyle counseling.',
        photoUrl: '/images/doctor_david_kim.jpg',
        clinicRoom: 'Suite 101 - Primary Care Wing',
        active: true,
        schedule: weekdaySchedule,
        rating: 4.85,
        reviewCount: 210,
      },
      {
        id: 'doc-5',
        name: 'Dr. Claire Laurent',
        specialization: 'Dermatology',
        qualifications: 'MD, FAAD, Yale School of Medicine',
        experience: 9,
        consultationFee: 150,
        biography: 'Dr. Claire Laurent is a clinical dermatologist specializing in acne management, dermatological diagnostics, skin allergy treatment, and preventative cutaneous health screenings.',
        photoUrl: '/images/doctor_claire_laurent.jpg',
        clinicRoom: 'Suite 210 - Dermatology Suite',
        active: true,
        schedule: weekdaySchedule,
        rating: 4.9,
        reviewCount: 125,
      },
      {
        id: 'doc-6',
        name: 'Dr. Robert Hastings',
        specialization: 'Diagnostic Consultation',
        qualifications: 'MD, FRCR, University of Pennsylvania',
        experience: 18,
        consultationFee: 190,
        biography: 'Dr. Robert Hastings is a diagnostic specialist analyzing complex medical cases, medical imaging interpretations, and multi-system clinical health reviews for accurate therapeutic planning.',
        photoUrl: '/images/doctor_robert_hastings.jpg',
        clinicRoom: 'Suite 405 - Advanced Diagnostics',
        active: true,
        schedule: weekdaySchedule,
        rating: 4.92,
        reviewCount: 84,
      },
      {
        id: 'doc-7',
        name: 'Dr. Priya Patel',
        specialization: 'Dental Care',
        qualifications: 'DDS, Tufts University School of Dental Medicine',
        experience: 10,
        consultationFee: 125,
        biography: 'Dr. Priya Patel provides gentle dental consultations, preventative oral hygiene evaluations, restorative treatment consultations, and comprehensive periodontal assessments.',
        photoUrl: '/images/doctor_priya_patel.jpg',
        clinicRoom: 'Suite 112 - Dental Clinic Wing',
        active: true,
        schedule: alternateSchedule,
        rating: 4.88,
        reviewCount: 112,
      },
      {
        id: 'doc-8',
        name: 'Dr. Samuel Green',
        specialization: 'Cardiology',
        qualifications: 'MD, FESC, Northwestern University',
        experience: 15,
        consultationFee: 165,
        biography: 'Dr. Samuel Green focuses on heart rhythm management, lipidology, and pre-operative cardiac evaluations with an emphasis on evidence-based non-invasive therapies.',
        photoUrl: '/images/doctor_samuel_green.jpg',
        clinicRoom: 'Suite 205 - Cardiovascular Wing',
        active: true,
        schedule: weekdaySchedule,
        rating: 4.79,
        reviewCount: 76,
      },
    ];

    // 3. Seed Medical Services
    this.services = [
      {
        id: 'srv-1',
        name: 'General Consultation',
        description: 'Comprehensive physical examination, health evaluation, routine laboratory assessment, and general wellness counseling.',
        category: 'Primary Care',
        durationMinutes: 30,
        baseFee: 110,
        iconName: 'Stethoscope',
        doctorSpecialty: 'General Consultation',
        active: true,
      },
      {
        id: 'srv-2',
        name: 'Cardiology Assessment',
        description: 'Specialist cardiac evaluation, blood pressure monitoring, resting ECG review, and cardiovascular risk profiling.',
        category: 'Specialist Care',
        durationMinutes: 30,
        baseFee: 160,
        iconName: 'HeartPulse',
        doctorSpecialty: 'Cardiology',
        active: true,
      },
      {
        id: 'srv-3',
        name: 'Dermatological Examination',
        description: 'Targeted skin check, dermoscopy evaluation of moles, allergic dermatosis diagnosis, and customized therapeutic regimens.',
        category: 'Specialist Care',
        durationMinutes: 30,
        baseFee: 150,
        iconName: 'Sparkles',
        doctorSpecialty: 'Dermatology',
        active: true,
      },
      {
        id: 'srv-4',
        name: 'Pediatric Well-Child Visit',
        description: 'Growth and milestone assessment, pediatric preventative health consultation, and developmental monitoring for children.',
        category: 'Pediatrics',
        durationMinutes: 30,
        baseFee: 130,
        iconName: 'Baby',
        doctorSpecialty: 'Pediatrics',
        active: true,
      },
      {
        id: 'srv-5',
        name: 'Orthopedic & Joint Consultation',
        description: 'Clinical evaluation of joint mobility, spine and posture assessment, acute injury review, and non-surgical treatment plans.',
        category: 'Specialist Care',
        durationMinutes: 30,
        baseFee: 175,
        iconName: 'Activity',
        doctorSpecialty: 'Orthopedics',
        active: true,
      },
      {
        id: 'srv-6',
        name: 'Dental Care & Oral Consultation',
        description: 'Oral hygiene screening, dental examination, gum health check, and preventive dental health advisement.',
        category: 'Dental',
        durationMinutes: 30,
        baseFee: 125,
        iconName: 'Smile',
        doctorSpecialty: 'Dental Care',
        active: true,
      },
      {
        id: 'srv-7',
        name: 'Diagnostic Clinical Consultation',
        description: 'In-depth secondary consultation reviewing diagnostic scans, lab panels, and coordinating multi-specialty care pathways.',
        category: 'Diagnostics',
        durationMinutes: 45,
        baseFee: 190,
        iconName: 'FileSearch',
        doctorSpecialty: 'Diagnostic Consultation',
        active: true,
      },
    ];

    // 4. Seed Appointments
    // Let's seed realistic dates around today
    const today = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    this.appointments = [
      {
        id: 'apt-101',
        bookingReference: 'MCP-2026-1049',
        patientId: 'usr-pat-1',
        patientName: 'James Wilson',
        patientEmail: 'james.wilson@example.com',
        patientPhone: '+1 (555) 234-5678',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Jenkins',
        doctorSpecialty: 'Cardiology',
        serviceId: 'srv-2',
        serviceName: 'Cardiology Assessment',
        date: formatDate(0), // Today
        timeSlot: '10:00',
        durationMinutes: 30,
        fee: 160,
        status: 'confirmed',
        reason: 'Routine annual cardiovascular checkup and blood pressure monitoring.',
        createdAt: '2026-10-25T14:20:00.000Z',
      },
      {
        id: 'apt-102',
        bookingReference: 'MCP-2026-1052',
        patientId: 'usr-pat-1',
        patientName: 'James Wilson',
        patientEmail: 'james.wilson@example.com',
        patientPhone: '+1 (555) 234-5678',
        doctorId: 'doc-2',
        doctorName: 'Dr. Marcus Vance',
        doctorSpecialty: 'Orthopedics',
        serviceId: 'srv-5',
        serviceName: 'Orthopedic & Joint Consultation',
        date: formatDate(2), // 2 days in future
        timeSlot: '11:30',
        durationMinutes: 30,
        fee: 175,
        status: 'pending',
        reason: 'Mild right knee soreness following weekend jogging.',
        createdAt: '2026-10-28T09:15:00.000Z',
      },
      {
        id: 'apt-103',
        bookingReference: 'MCP-2026-0988',
        patientId: 'usr-pat-2',
        patientName: 'Emily Chen',
        patientEmail: 'emily.chen@example.com',
        patientPhone: '+1 (555) 345-6789',
        doctorId: 'doc-3',
        doctorName: 'Dr. Elena Rodriguez',
        doctorSpecialty: 'Pediatrics',
        serviceId: 'srv-4',
        serviceName: 'Pediatric Well-Child Visit',
        date: formatDate(1), // Tomorrow
        timeSlot: '14:30',
        durationMinutes: 30,
        fee: 130,
        status: 'confirmed',
        reason: 'Regular 2-year pediatric milestone check and diet guidance.',
        createdAt: '2026-10-27T16:00:00.000Z',
      },
      {
        id: 'apt-104',
        bookingReference: 'MCP-2026-0912',
        patientId: 'usr-pat-1',
        patientName: 'James Wilson',
        patientEmail: 'james.wilson@example.com',
        patientPhone: '+1 (555) 234-5678',
        doctorId: 'doc-4',
        doctorName: 'Dr. David Kim',
        doctorSpecialty: 'General Consultation',
        serviceId: 'srv-1',
        serviceName: 'General Consultation',
        date: formatDate(-7), // Last week (completed)
        timeSlot: '09:30',
        durationMinutes: 30,
        fee: 110,
        status: 'completed',
        reason: 'Seasonal allergy prescription renewal and general physical check.',
        notes: 'Patient responded well to non-drowsy antihistamines. Vitals normal.',
        createdAt: '2026-10-15T11:00:00.000Z',
      },
      {
        id: 'apt-105',
        bookingReference: 'MCP-2026-0944',
        patientId: 'usr-pat-2',
        patientName: 'Emily Chen',
        patientEmail: 'emily.chen@example.com',
        patientPhone: '+1 (555) 345-6789',
        doctorId: 'doc-5',
        doctorName: 'Dr. Claire Laurent',
        doctorSpecialty: 'Dermatology',
        serviceId: 'srv-3',
        serviceName: 'Dermatological Examination',
        date: formatDate(-3),
        timeSlot: '15:00',
        durationMinutes: 30,
        fee: 150,
        status: 'completed',
        reason: 'Evaluation of persistent dry patch on forearm.',
        notes: 'Prescribed topical barrier cream. Follow up if unresolved in 4 weeks.',
        createdAt: '2026-10-20T10:30:00.000Z',
      },
      {
        id: 'apt-106',
        bookingReference: 'MCP-2026-1060',
        patientId: 'usr-pat-3',
        patientName: 'Michael Turner',
        patientEmail: 'm.turner@example.com',
        patientPhone: '+1 (555) 456-7890',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Jenkins',
        doctorSpecialty: 'Cardiology',
        serviceId: 'srv-2',
        serviceName: 'Cardiology Assessment',
        date: formatDate(0), // Today
        timeSlot: '14:00',
        durationMinutes: 30,
        fee: 160,
        status: 'confirmed',
        reason: 'Post-stress test physician review.',
        createdAt: '2026-10-29T13:40:00.000Z',
      },
    ];
  }

  // Double booking validation engine
  isSlotAvailable(doctorId: string, date: string, timeSlot: string, excludeAppointmentId?: string): boolean {
    const existing = this.appointments.find((apt) => {
      if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
      return apt.doctorId === doctorId &&
        apt.date === date &&
        apt.timeSlot === timeSlot &&
        apt.status !== 'cancelled';
    });
    return !existing;
  }

  // Get available slots for a doctor on a specific date
  getDoctorAvailabilityForDate(doctorId: string, dateStr: string): {
    isWorkingDay: boolean;
    slots: string[];
    bookedSlots: string[];
    availableSlots: string[];
  } {
    const doctor = this.doctors.find((d) => d.id === doctorId);
    if (!doctor || !doctor.active) {
      return { isWorkingDay: false, slots: [], bookedSlots: [], availableSlots: [] };
    }

    const targetDate = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = targetDate.getDay();

    const scheduleRule = doctor.schedule.find((s) => s.dayOfWeek === dayOfWeek);
    if (!scheduleRule) {
      return { isWorkingDay: false, slots: [], bookedSlots: [], availableSlots: [] };
    }

    // Generate timeslots
    const slots: string[] = [];
    const [startHour, startMin] = scheduleRule.startTime.split(':').map(Number);
    const [endHour, endMin] = scheduleRule.endTime.split(':').map(Number);
    const step = scheduleRule.slotDurationMinutes || 30;

    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    let lunchStartTotal = -1;
    let lunchEndTotal = -1;
    if (scheduleRule.lunchBreakStart && scheduleRule.lunchBreakEnd) {
      const [lhS, lmS] = scheduleRule.lunchBreakStart.split(':').map(Number);
      const [lhE, lmE] = scheduleRule.lunchBreakEnd.split(':').map(Number);
      lunchStartTotal = lhS * 60 + lmS;
      lunchEndTotal = lhE * 60 + lmE;
    }

    for (let m = startTotal; m < endTotal; m += step) {
      // Exclude lunch break
      if (lunchStartTotal >= 0 && m >= lunchStartTotal && m < lunchEndTotal) {
        continue;
      }
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }

    // Find booked slots for this date
    const bookedSlots = this.appointments
      .filter((apt) => apt.doctorId === doctorId && apt.date === dateStr && apt.status !== 'cancelled')
      .map((apt) => apt.timeSlot);

    // Also if target date is today, block past time slots
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const availableSlots = slots.filter((slot) => {
      if (bookedSlots.includes(slot)) return false;
      if (isToday) {
        const [h, min] = slot.split(':').map(Number);
        if (h * 60 + min <= currentMinutes + 15) {
          return false; // must book at least 15 min in advance today
        }
      }
      return true;
    });

    return {
      isWorkingDay: true,
      slots,
      bookedSlots,
      availableSlots,
    };
  }

  // Generate unique booking reference
  generateBookingReference(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `MCP-2026-${randomDigits}`;
  }
}

export const db = new DatabaseStore();
