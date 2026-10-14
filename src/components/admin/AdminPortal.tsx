'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Building2, CheckCircle2, ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { ExamAdminPanel } from '@/components/admin/ExamAdminPanel';
import { ExamSubmissionsPanel } from '@/components/admin/ExamSubmissionsPanel';
import { QuestionBankPanel } from '@/components/admin/QuestionBankPanel';
import { ExamDaysPanel } from '@/components/admin/ExamDaysPanel';
import { CollegePortal } from '@/components/college/CollegePortal';
import { CapCycleSettings } from '@/components/admin/CapCycleSettings';

type Application = { id: string; application_number?: string; user_id?: string; status?: string; personal_data?: Record<string, unknown>; academic_data?: Record<string, unknown>; created_at?: string };
type ModuleSetting = { key: string; value: unknown };
type NavItem = { id: string; label: string; icon: typeof LayoutDashboard };

const nav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', icon: ClipboardList },
  { id: 'examination', label: 'Examination', icon: ClipboardList },
  { id: 'submissions', label: 'Submissions', icon: CheckCircle2 },
  { id: 'question-bank', label: 'Question Bank', icon: Search },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'college-portal', label: 'College Portal', icon: Building2 },
  { id: 'notices', label: 'Notices', icon: Bell },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

const settingKeys = [
  ['hall_ticket_enabled', 'Hall Ticket module'], ['score_card_enabled', 'Score Card module'],
  ['score_card_published', 'Publish Score Card'], ['cap_registration_enabled', 'CAP Registration'],
  ['exam_enabled', 'Examination module'], ['documents_enabled', 'Document uploads'],
  ['notices_enabled', 'Notices'], ['results_enabled', 'Results'],
] as const;

const settingEnabled = (value: unknown) => value === true || value === 'true';

export default function AdminPortal() {
  const router = useRouter();
  const [active, setActive] = useState('applications');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [moduleSettings, setModuleSettings] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);

  const loadApplications = async () => {
    const { data, error: dbError } = await createClient().from('applications').select('id, application_number, user_id, status, personal_data, academic_data, created_at').order('created_at', { ascending: false });
    if (dbError) setError('Unable to load applications. Check Supabase permissions.');
    else setApplications(data ?? []);
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      const client = createClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user) { router.replace('/admin/login'); return; }
      const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || !['admin', 'super_admin'].includes(profile.role)) { router.replace('/admin/login'); return; }
      const { data: rows, error: settingsError } = await client.from('module_settings').select('key, value');
      if (settingsError) setError(`Unable to load module settings: ${settingsError.message}`);
      if (process.env.NODE_ENV === 'development') console.log('[v0] Admin CAP setting diagnostics', { table: 'module_settings', key: 'cap_registration_enabled', rowExists: Boolean(rows?.some((row) => row.key === 'cap_registration_enabled')), value: rows?.find((row) => row.key === 'cap_registration_enabled')?.value, error: settingsError?.message ?? null, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL });
      setModuleSettings(Object.fromEntries(((rows ?? []) as ModuleSetting[]).map((row) => [row.key, row.value])));
      await loadApplications();
      setReady(true);
    };
    void verifyAdmin();
  }, [router]);

  const filtered = useMemo(() => applications.filter((app) => JSON.stringify(app).toLowerCase().includes(query.toLowerCase())), [applications, query]);
  const getName = (app: Application) => String(app.personal_data?.fullName || app.personal_data?.full_name || 'Unnamed candidate');
  const getEmail = (app: Application) => String(app.personal_data?.email || 'Email unavailable');

  const updateStatus = async (status: string) => {
    if (!selected) return;
    const { error: updateError } = await createClient().from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', selected.id);
    if (updateError) setError('Unable to update application status.');
    else { setApplications((items) => items.map((item) => item.id === selected.id ? { ...item, status } : item)); setSelected({ ...selected, status }); }
  };

  const updateModuleSetting = async (key: string, value: boolean) => {
    const client = createClient();
    setError('');
    setSuccess('');
    const { data: savedSetting, error: updateError } = await client.from('module_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }).select('key').single();
    if (updateError || !savedSetting?.key) {
      const message = updateError?.message ?? 'Supabase did not return the saved setting.';
      setError(`Unable to update module setting: ${message}`);
      if (process.env.NODE_ENV === 'development') console.error('[v0] Admin CAP setting save failed', { key, error: message });
      return;
    }
    setModuleSettings((current) => ({ ...current, [savedSetting.key]: value }));
    setSuccess(`${savedSetting.key} saved successfully.`);
  };

  if (!ready) return <div className="p-8 text-sm text-slate-500">Loading admin portal…</div>;

  return <div className="min-h-screen bg-slate-50 text-slate-900 -m-4 md:-m-6 flex">
    <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#092f52] text-white transition-transform flex flex-col`}>
      <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10"><div className="h-11 w-11 rounded-full bg-white p-1"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cet%20cell%20official%20logo-EVXGcUThytCHkwOqahzhC0IAo6dk0E.png" alt="CET Cell official logo" className="h-full w-full object-contain" /></div><div><p className="font-bold">CET CELL</p><p className="text-[10px] text-blue-200 uppercase tracking-widest">Maharashtra State</p></div><button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <nav className="p-4 space-y-1">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setActive(id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left ${active === id ? 'bg-[#e8a317] text-[#092f52] font-semibold' : 'text-blue-50/80 hover:bg-white/10'}`}><Icon size={17} />{label}</button>)}</nav>
      <div className="mt-auto p-5 border-t border-white/10 flex items-center gap-3"><ShieldCheck size={18} className="text-[#e8a317]" /><span className="text-xs">Administrator</span><LogOut size={15} className="ml-auto" /></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
    <main className="flex-1 min-w-0"><header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8"><div className="flex items-center gap-4"><button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button><div><p className="text-xs text-slate-400 uppercase tracking-wider">State Common Entrance Test Cell</p><h1 className="text-xl font-bold text-[#092f52]">{nav.find((item) => item.id === active)?.label}</h1></div></div><span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">System operational</span></header>
      <section className="p-4 md:p-8 max-w-[1500px] mx-auto">{active === 'college-portal' ? <CollegePortal adminReview /> : active === 'examination' ? <><ExamDaysPanel /><ExamAdminPanel /></> : active === 'submissions' ? <ExamSubmissionsPanel /> : active === 'question-bank' ? <QuestionBankPanel /> : active === 'settings' ? <div className="max-w-3xl"><CapCycleSettings /><p className="text-sm text-slate-500">Live controls stored in Supabase</p><h2 className="text-3xl font-bold text-[#092f52]">System Settings</h2><div className="mt-6 grid gap-3">{settingKeys.map(([key, label]) => <label key={key} className="flex items-center justify-between border border-slate-200 bg-white p-4"><span className="font-semibold">{label}</span><input type="checkbox" checked={settingEnabled(moduleSettings[key])} onChange={(event) => void updateModuleSetting(key, event.target.checked)} /></label>)}</div>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}{success && <p className="mt-4 text-sm text-emerald-700">{success}</p>}</div> : <div><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Review and manage student applications</p><h2 className="text-3xl font-bold text-[#092f52]">Applications</h2></div><div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" /><button onClick={() => void loadApplications()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Refresh</button></div></div>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[1fr_1fr_140px_100px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"><span>Candidate</span><span>Application</span><span>Status</span><span>Action</span></div>{filtered.map((app) => <div key={app.id} className="grid grid-cols-[1fr_1fr_140px_100px] gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-0"><div><p className="font-semibold">{getName(app)}</p><p className="text-xs text-slate-500">{getEmail(app)}</p></div><span>{app.application_number ?? 'Pending'}</span><span className="font-semibold">{app.status ?? 'SUBMITTED'}</span><button onClick={() => setSelected(app)} className="text-left font-semibold text-blue-700">Review</button></div>)}</div></div>}</section>
    </main>
    {selected && <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 flex items-center justify-center"><div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="p-5 border-b flex items-center justify-between"><div><h2 className="text-xl font-bold text-[#092f52]">Application review</h2><p className="text-sm text-slate-500">{getName(selected)} · {selected.application_number}</p></div><button onClick={() => setSelected(null)} aria-label="Close review"><X /></button></div><div className="p-5 grid sm:grid-cols-2 gap-4 text-sm">{Object.entries({ ...selected.personal_data, ...selected.academic_data }).map(([key, value]) => <div key={key}><p className="text-xs uppercase text-slate-400">{key.replaceAll('_', ' ')}</p><p className="font-medium mt-1 break-words">{String(value || 'Not provided')}</p></div>)}</div><div className="p-5 border-t flex flex-wrap gap-3"><button onClick={() => void updateStatus('APPROVED')} className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-semibold">Confirm</button><button onClick={() => void updateStatus('UNDER_REVIEW')} className="border border-blue-300 text-blue-700 rounded-md px-4 py-2 text-sm font-semibold">Mark under review</button><button onClick={() => void updateStatus('REJECTED')} className="border border-red-300 text-red-700 rounded-md px-4 py-2 text-sm font-semibold">Reject</button></div></div></div>}
  </div>;
}
