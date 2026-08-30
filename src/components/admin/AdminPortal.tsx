'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ApplicationStatus, StudentApplication } from '@/types/student';
import {
  Activity, Bell, BookOpen, CheckCircle2, ChevronRight, ClipboardList, FileCheck2,
  FileText, GraduationCap, LayoutDashboard, LogOut, Menu, Search, Settings,
  ShieldCheck, Ticket, Users, X, AlertCircle, RefreshCw
} from 'lucide-react';

type Module = 'dashboard' | 'applications' | 'students' | 'documents' | 'hall-tickets' | 'examinations' | 'questions' | 'results' | 'scorecards' | 'notices' | 'settings' | 'admins' | 'audit';

const nav: { id: Module; label: string; icon: typeof LayoutDashboard; group: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'applications', label: 'Applications', icon: ClipboardList, group: 'Admissions' },
  { id: 'students', label: 'Students', icon: Users, group: 'Admissions' },
  { id: 'documents', label: 'Documents', icon: FileCheck2, group: 'Admissions' },
  { id: 'hall-tickets', label: 'Hall Tickets', icon: Ticket, group: 'Examination' },
  { id: 'examinations', label: 'Examinations', icon: BookOpen, group: 'Examination' },
  { id: 'questions', label: 'Question Bank', icon: FileText, group: 'Examination' },
  { id: 'results', label: 'Results', icon: GraduationCap, group: 'Examination' },
  { id: 'scorecards', label: 'Scorecards', icon: Activity, group: 'Examination' },
  { id: 'notices', label: 'Notices', icon: Bell, group: 'Administration' },
  { id: 'admins', label: 'Admin Users', icon: ShieldCheck, group: 'Administration' },
  { id: 'audit', label: 'Audit Logs', icon: Activity, group: 'Administration' },
  { id: 'settings', label: 'System Settings', icon: Settings, group: 'Administration' },
];

const statusStyles: Record<string, string> = { submitted: 'bg-amber-50 text-amber-700 border-amber-200', verified: 'bg-emerald-50 text-emerald-700 border-emerald-200', rejected: 'bg-red-50 text-red-700 border-red-200', under_review: 'bg-blue-50 text-blue-700 border-blue-200', draft: 'bg-slate-100 text-slate-600 border-slate-200' };

function formatStatus(status?: string) { return (status || 'submitted').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }

export default function AdminPortal() {
  const [active, setActive] = useState<Module>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const loadApplications = async () => {
    setLoading(true); setError('');
    const { data, error: dbError } = await createClient().from('applications').select('*').order('created_at', { ascending: false });
    if (dbError) { setError('Unable to load applications. Check your Supabase permissions.'); setLoading(false); return; }
    setApplications((data || []).map((row) => ({ id: row.id, ...row.personal_data, ...row.academic_data, applicationNumber: row.application_number, userId: row.user_id, status: String(row.status).toUpperCase() as ApplicationStatus, createdAt: row.created_at, updatedAt: row.updated_at } as StudentApplication)));
    setLoading(false);
  };

  useEffect(() => { loadApplications(); }, []);

  const filtered = useMemo(() => applications.filter((item) => {
    const text = `${item.fullName || ''} ${item.email || ''} ${item.applicationNumber || ''}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (filter === 'all' || String(item.status).toLowerCase() === filter);
  }), [applications, query, filter]);

  const counts = useMemo(() => ({ total: applications.length, submitted: applications.filter((a) => String(a.status).toLowerCase() === 'submitted').length, verified: applications.filter((a) => ['verified', 'approved'].includes(String(a.status).toLowerCase())).length, rejected: applications.filter((a) => String(a.status).toLowerCase() === 'rejected').length }), [applications]);
  const groups = Array.from(new Set(nav.map((item) => item.group)));

  return <div className="min-h-screen bg-[#f4f7fa] text-slate-900 -m-4 md:-m-6 flex">
    <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#092f52] text-white transition-transform duration-200 flex flex-col`}>
      <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10"><div className="h-11 w-11 rounded-full bg-white p-1"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cet%20cell%20official%20logo-EVXGcUThytCHkwOqahzhC0IAo6dk0E.png" alt="CET Cell official logo" className="h-full w-full object-contain" /></div><div><p className="font-bold tracking-wide">CET CELL</p><p className="text-[10px] text-blue-200 uppercase tracking-widest">Maharashtra State</p></div><button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <div className="px-4 py-5 flex-1 overflow-y-auto">{groups.map((group) => <div key={group} className="mb-6"><p className="px-3 mb-2 text-[10px] uppercase tracking-[.18em] text-blue-200/70">{group}</p><div className="space-y-1">{nav.filter((item) => item.group === group).map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition ${active === item.id ? 'bg-[#e8a317] text-[#092f52] font-semibold' : 'text-blue-50/80 hover:bg-white/10 hover:text-white'}`}><Icon size={17} />{item.label}{active === item.id && <ChevronRight size={15} className="ml-auto" />}</button>; })}</div></div>)}</div>
      <div className="p-4 border-t border-white/10"><div className="flex items-center gap-3 px-2"><div className="h-9 w-9 rounded-full bg-[#e8a317] text-[#092f52] flex items-center justify-center font-bold">A</div><div className="min-w-0"><p className="text-sm font-semibold truncate">Portal Administrator</p><p className="text-xs text-blue-200/70">SUPER ADMIN</p></div><LogOut size={16} className="ml-auto text-blue-200/70" /></div></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
    <main className="flex-1 min-w-0"><header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8"><div className="flex items-center gap-4"><button className="lg:hidden text-slate-600" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button><div><p className="text-xs text-slate-400 uppercase tracking-wider">State Common Entrance Test Cell</p><h1 className="text-xl font-bold text-[#092f52]">{nav.find((item) => item.id === active)?.label}</h1></div></div><div className="flex items-center gap-3"><div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> System operational</div><button className="h-9 w-9 border border-slate-200 rounded-md flex items-center justify-center text-slate-500" aria-label="Notifications"><Bell size={17} /></button></div></header>
      <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
        {active === 'dashboard' ? <Dashboard counts={counts} applications={applications} onOpen={() => setActive('applications')} /> : active === 'applications' || active === 'students' || active === 'documents' ? <Applications applications={filtered} loading={loading} error={error} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} reload={loadApplications} /> : <ModuleEmpty label={nav.find((item) => item.id === active)?.label || ''} />}
      </div>
    </main>
  </div>;
}

function Dashboard({ counts, applications, onOpen }: { counts: { total: number; submitted: number; verified: number; rejected: number }; applications: StudentApplication[]; onOpen: () => void }) { return <div className="space-y-7"><div className="flex flex-col md:flex-row md:items-end justify-between gap-3"><div><p className="text-sm text-slate-500">Sunday, 30 August 2026</p><h2 className="text-3xl font-bold text-[#092f52] mt-1">Good morning, Administrator</h2><p className="text-slate-500 mt-2">Here is today&apos;s admissions overview.</p></div><button onClick={onOpen} className="bg-[#092f52] text-white px-4 py-2.5 rounded-md text-sm font-semibold">View applications</button></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{([{ label: 'Total applications', value: counts.total, tone: 'bg-blue-50 text-blue-700', Icon: ClipboardList }, { label: 'Awaiting review', value: counts.submitted, tone: 'bg-amber-50 text-amber-700', Icon: AlertCircle }, { label: 'Verified applications', value: counts.verified, tone: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2 }, { label: 'Rejected applications', value: counts.rejected, tone: 'bg-red-50 text-red-700', Icon: FileText }]).map(({ label, value, tone, Icon }) => <div key={label} className="bg-white border border-slate-200 rounded-lg p-5"><div className="flex items-start justify-between"><p className="text-sm text-slate-500">{label}</p><div className={`h-9 w-9 rounded-md flex items-center justify-center ${tone}`}><Icon size={18} /></div></div><p className="text-3xl font-bold text-[#092f52] mt-5">{value}</p><p className="text-xs text-slate-400 mt-1">Updated from Supabase</p></div>)}</div><div className="grid xl:grid-cols-[1.5fr_1fr] gap-5"><div className="bg-white border border-slate-200 rounded-lg"><div className="p-5 border-b border-slate-100 flex justify-between"><div><h3 className="font-bold text-[#092f52]">Recent applications</h3><p className="text-xs text-slate-500 mt-1">Latest candidate submissions</p></div><button onClick={onOpen} className="text-sm font-semibold text-[#1769aa]">View all</button></div><div className="divide-y divide-slate-100">{applications.slice(0, 5).map((app) => <div key={app.id} className="p-4 flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-blue-50 text-[#1769aa] flex items-center justify-center font-bold text-sm">{(app.fullName || 'S').charAt(0)}</div><div className="min-w-0 flex-1"><p className="font-semibold text-sm truncate">{app.fullName || 'Unnamed candidate'}</p><p className="text-xs text-slate-500">{app.applicationNumber || 'No application number'}</p></div><span className={`border rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[String(app.status).toLowerCase()] || statusStyles.submitted}`}>{formatStatus(String(app.status))}</span></div>)}{applications.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No applications found.</p>}</div></div><div className="bg-[#092f52] text-white rounded-lg p-6"><p className="text-blue-200 text-xs uppercase tracking-wider">Portal health</p><h3 className="text-xl font-bold mt-2">All systems operational</h3><div className="mt-6 space-y-4 text-sm"><div className="flex justify-between border-b border-white/10 pb-3"><span className="text-blue-100">Database connection</span><span className="text-emerald-300">Connected</span></div><div className="flex justify-between border-b border-white/10 pb-3"><span className="text-blue-100">Authentication</span><span className="text-emerald-300">Protected</span></div><div className="flex justify-between"><span className="text-blue-100">Last sync</span><span>Just now</span></div></div></div></div></div> }

function Applications({ applications, loading, error, query, setQuery, filter, setFilter, reload }: { applications: StudentApplication[]; loading: boolean; error: string; query: string; setQuery: (v: string) => void; filter: string; setFilter: (v: string) => void; reload: () => void }) { return <div className="space-y-6"><div><p className="text-sm text-slate-500">Admissions management</p><h2 className="text-3xl font-bold text-[#092f52] mt-1">Applications</h2></div><div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-3"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email or application number" className="w-full border border-slate-200 rounded-md pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" /></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-slate-200 rounded-md px-3 py-2.5 text-sm bg-white"><option value="all">All statuses</option><option value="submitted">Submitted</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select><button onClick={reload} className="border border-slate-200 rounded-md px-3 text-slate-600" aria-label="Refresh applications"><RefreshCw size={17} /></button></div>{error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}<div className="bg-white border border-slate-200 rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Candidate</th><th className="p-4">Application no.</th><th className="p-4">Category</th><th className="p-4">Submitted</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="p-10 text-center text-slate-500">Loading applications...</td></tr> : applications.map((app) => <tr key={app.id} className="hover:bg-slate-50"><td className="p-4"><p className="font-semibold text-[#092f52]">{app.fullName || 'Unnamed candidate'}</p><p className="text-xs text-slate-500">{app.email || 'No email'}</p></td><td className="p-4 font-mono text-xs">{app.applicationNumber || '—'}</td><td className="p-4">{app.category || '—'}</td><td className="p-4 text-slate-500">{app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}</td><td className="p-4"><span className={`border rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[String(app.status).toLowerCase()] || statusStyles.submitted}`}>{formatStatus(String(app.status))}</span></td><td className="p-4"><button className="text-[#1769aa] font-semibold text-xs">Review <ChevronRight size={14} className="inline" /></button></td></tr>)}{!loading && applications.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-slate-500">No matching applications.</td></tr>}</tbody></table></div></div></div> }

function ModuleEmpty({ label }: { label: string }) { return <div className="min-h-[55vh] flex items-center justify-center"><div className="text-center max-w-md"><div className="h-14 w-14 rounded-full bg-blue-50 text-[#1769aa] flex items-center justify-center mx-auto"><Settings size={25} /></div><h2 className="text-2xl font-bold text-[#092f52] mt-5">{label}</h2><p className="text-slate-500 mt-2">This module is ready for Supabase-backed records and role-based workflows.</p><span className="inline-block mt-5 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">Configuration required</span></div></div> }
