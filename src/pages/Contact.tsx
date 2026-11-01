import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Phone, Mail, MapPin, Clock, ShieldAlert, CheckCircle2, Send, AlertCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.submitContact({ name, email, phone, subject, message });
      setSuccess(res.message);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#124E78]">Inquiries & Location</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Contact MediCare Plus</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Get in touch with our patient coordination desk for general clinic inquiries or administrative requests.
        </p>
      </div>

      {/* Emergency Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-rose-950">Immediate Medical Attention Notice</span>
          <span>
            This contact form is monitored during standard reception hours only and is NOT for acute emergency medical assistance. If you are experiencing chest pain, difficulty breathing, or severe trauma, call 911 immediately or proceed to the nearest emergency department.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Send an Inquiry</h2>
          <p className="text-xs text-slate-500 mb-6">Our clinic coordination team will respond within 24 business hours.</p>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Insurance coverage question"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our clinical administrative staff assist you?"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Clinic Info & Interactive Map Mockup */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Clinic Direct Contact</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Physical Location</p>
                  <p className="text-slate-500">450 Healthcare Boulevard, Suite 300, Metro Health District, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Reception Phone</p>
                  <p className="text-slate-500">+1 (800) 456-7890 (Toll Free)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Email Inquiries</p>
                  <p className="text-slate-500">appointments@medicareplus-clinic.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Operating Hours</p>
                  <p className="text-slate-500">Mon - Fri: 08:00 AM - 08:00 PM</p>
                  <p className="text-slate-500">Saturday: 09:00 AM - 05:00 PM</p>
                  <p className="text-slate-500">Sunday: 10:00 AM - 02:00 PM (Urgent Care)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Presentation */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Metro Health District Map</span>
              <span className="text-teal-700 font-medium">GPS: 40.7488° N, 73.9857° W</span>
            </div>
            {/* Visual stylised map placeholder */}
            <div className="h-44 bg-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-300/80">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#124E78_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative text-center p-4 bg-white/90 backdrop-blur-xs rounded-xl shadow-xs border border-slate-200/80">
                <div className="w-8 h-8 rounded-full bg-[#124E78] text-white flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                  <MapPin className="w-4 h-4 text-teal-400" />
                </div>
                <p className="font-bold text-xs text-slate-900">MediCare Plus Outpatient Clinic</p>
                <p className="text-[10px] text-slate-500">Suite 300, 450 Healthcare Blvd</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Ample parking available in Building B underground garage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
