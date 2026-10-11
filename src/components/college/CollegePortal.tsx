'use client';

import { useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, ClipboardCheck, FileText, GraduationCap, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';

const sections = [
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'students', label: 'Allotted Students', icon: Users },
  { id: 'verification', label: 'Document Verification', icon: ClipboardCheck },
  { id: 'courses', label: 'Courses & Seat Intake', icon: GraduationCap },
  { id: 'admission', label: 'Admission Status', icon: CheckCircle2 },
  { id: 'requests', label: 'Seat Intake Requests', icon: FileText },
];

export function CollegePortal({ adminReview = false }: { adminReview?: boolean }) {
  const [active, setActive] = useState('profile');
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = sections.find((section) => section.id === active) ?? sections[0];
  const Icon = current.icon;

  return (
    <div className="min-h-screen -m-4 flex bg-slate-50 text-slate-900 md:-m-6">
      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#092f52] text-white transition-transform lg:static lg:translate-x-0`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex size-11 items-center justify-center rounded-full bg-white text-[#092f52]"><Building2 /></div>
          <div><p className="font-bold">CET CELL</p><p className="text-[10px] uppercase tracking-widest text-blue-200">College Portal</p></div>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <div className="border-b border-white/10 px-5 py-4"><p className="text-xs uppercase tracking-widest text-blue-200">Institution workspace</p><p className="mt-1 font-semibold">College account</p><p className="mt-1 text-xs text-blue-100/70">Access activates after approval</p></div>
        <nav className="flex flex-col gap-1 p-4" aria-label="College portal sections">{sections.map(({ id, label, icon: SectionIcon }) => <button key={id} onClick={() => { setActive(id); setMobileOpen(false); }} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${active === id ? 'bg-[#e8a317] font-semibold text-[#092f52]' : 'text-blue-50/80 hover:bg-white/10'}`}><SectionIcon />{label}</button>)}</nav>
        <div className="mt-auto flex items-center gap-3 border-t border-white/10 p-5"><ShieldCheck className="text-[#e8a317]" /><span className="text-xs">Secure college access</span><LogOut className="ml-auto" /></div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
      <main className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8"><div className="flex items-center gap-4"><button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button><div><p className="text-xs uppercase tracking-wider text-slate-400">State Common Entrance Test Cell</p><h1 className="text-xl font-bold text-[#092f52]">{adminReview ? 'College Registration Requests' : current.label}</h1></div></div><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">Setup pending</span></header>
        <section className="mx-auto max-w-[1400px] p-4 md:p-8">{adminReview ? <RegistrationReview /> : <><div className="mb-6 flex items-start gap-4"><div className="rounded-xl bg-blue-100 p-3 text-[#092f52]"><Icon /></div><div><p className="text-xs font-semibold uppercase tracking-widest text-amber-700">College workspace</p><h2 className="mt-1 text-3xl font-bold text-[#092f52]">{current.label}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">This section is ready for secure Supabase integration. No live college records are displayed until ownership policies are in place.</p></div></div><SetupPending title={current.label} /></>}</section>
      </main>
    </div>
  );
}

function SetupPending({ title }: { title: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 shadow-sm"><div className="flex max-w-xl items-start gap-4"><div className="rounded-full bg-slate-100 p-3"><AlertCircle className="text-slate-500" /></div><div><h3 className="font-semibold text-[#092f52]">{title} setup pending</h3><p className="mt-2 text-sm leading-6 text-slate-500">Live data will appear here after the College Portal schema, authenticated ownership checks, and RLS policies are reviewed and deployed. This preview intentionally contains no fake students, seat counts, or admission statuses.</p></div></div></div>;
}

function RegistrationReview() {
  return <div className="space-y-6"><div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900"><p className="font-semibold">Review workflow only</p><p className="mt-1 text-blue-800/80">Registration requests will be loaded from Supabase after a dedicated table and admin policies are approved. Approval will never be automatic.</p></div><div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 shadow-sm"><div className="flex items-start gap-4"><div className="rounded-full bg-slate-100 p-3"><AlertCircle className="text-slate-500" /></div><div><h2 className="font-semibold text-[#092f52]">No registration requests connected</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">The review table is intentionally empty in this UI phase. Once the college request model exists, admins will be able to inspect details, verify documents, and explicitly approve or reject access.</p></div></div></div></div>;
}

export function CollegeRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  return <main className="mx-auto max-w-4xl px-4 py-10 md:py-16"><div className="mb-8 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">CET Cell · College Portal</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-[#092f52] md:text-4xl">Request college access</h1><p className="mt-3 text-sm leading-6 text-slate-600">Submit your institution details for administrative review. This phase records no data until the secure college schema is approved.</p></div>{submitted ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900"><CheckCircle2 className="mb-3" /><h2 className="font-semibold">Request preview complete</h2><p className="mt-1 text-sm">Database submission is disabled during this UI phase. Your details were not sent or stored.</p></div> : <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="grid gap-5 md:grid-cols-2"><Field label="College name" required /><Field label="Official email" type="email" required /><Field label="Contact person" required /><Field label="Phone number" type="tel" required /><Field label="District" required /><Field label="Address" required wide /><Field label="Courses offered" placeholder="e.g. BCA, MCA, B.Sc. Computer Science" wide /></div><button className="mt-7 rounded-md bg-[#092f52] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0d416e]" type="submit">Submit registration request</button><p className="mt-3 text-xs text-slate-500">Requests require CET Cell approval before any college login can be activated.</p></form>}</main>;
}

function Field({ label, type = 'text', placeholder, required, wide }: { label: string; type?: string; placeholder?: string; required?: boolean; wide?: boolean }) {
  return <label className={`${wide ? 'md:col-span-2' : ''} grid gap-1.5 text-sm font-semibold text-slate-700`}><span>{label}{required && <span className="text-amber-700"> *</span>}</span><input type={type} placeholder={placeholder} required={required} className="rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" /></label>;
}
