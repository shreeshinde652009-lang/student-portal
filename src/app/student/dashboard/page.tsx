'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clock3, FileText, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { StudentApplication } from '@/types/student';
import { CetDocumentCard } from '@/components/student/CetDocumentCard';

const display = (value: unknown) => String(value ?? 'Not available');
const parseSettingValue = (value: unknown): boolean | string => {
  if (typeof value === 'boolean' || typeof value === 'string') return value;
  return String(value ?? '');
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleSettings, setModuleSettings] = useState<Record<string, boolean | string>>({});

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/student/login'); return; }
      const { data: settingRows } = await supabase.from('module_settings').select('key, value');
      const nextSettings = Object.fromEntries((settingRows ?? []).map((row) => [row.key, parseSettingValue(row.value)]));
      setModuleSettings(nextSettings);
      const { data, error: queryError } = await supabase.from('applications').select('*').eq('user_id', user.id).maybeSingle();
      if (queryError) setError('Failed to fetch application details.');
      else if (data) setApplication({ id: data.id, ...data.personal_data, ...data.academic_data, applicationNumber: data.application_number, userId: data.user_id, status: data.status, createdAt: data.created_at, updatedAt: data.updated_at } as StudentApplication);
      else setError('No application record found for this account.');
      setLoading(false);
    };
    void load();
  }, [router]);

  const logout = async () => { await createClient().auth.signOut(); router.replace('/student/login'); };

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">Loading your application record…</main>;
  if (error || !application) return <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-16 text-center"><AlertCircle className="mx-auto text-destructive" size={42} /><h1 className="font-serif text-2xl font-bold">Application record unavailable</h1><p className="text-sm text-muted-foreground">{error}</p><button onClick={logout} className="mx-auto inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><LogOut size={15} /> Return to login</button></main>;

  const approved = application.status === 'APPROVED';
  const visibility = { hallTicket: moduleSettings.hall_ticket_enabled === true, scoreCard: moduleSettings.score_card_enabled === true && moduleSettings.score_card_published === true, capRegistration: moduleSettings.cap_registration_enabled === true, exam: moduleSettings.exam_enabled === true, documents: moduleSettings.documents_enabled === true, notices: moduleSettings.notices_enabled === true, results: moduleSettings.results_enabled === true };
  const statusLabel = display(application.status).replaceAll('_', ' ');
  return <main className="min-h-screen bg-muted px-4 py-8 text-foreground"><div className="mx-auto flex max-w-6xl flex-col gap-6">
    <header className="flex flex-col gap-4 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Maharashtra CET Cell / Student Portal</p><h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Candidate Control Centre</h1><p className="mt-1 text-sm text-muted-foreground">Welcome, {display(application.fullName)}. Your submitted record is the source of truth.</p></div><button onClick={logout} className="inline-flex items-center gap-2 self-start border border-slate-300 bg-card px-4 py-2 text-sm font-semibold sm:self-auto"><LogOut size={15} /> Logout</button></header>
    <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="border border-primary bg-primary p-6 text-primary-foreground shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-foreground/70">Application number</p><p className="mt-2 font-mono text-2xl font-bold tracking-wider">{display(application.applicationNumber)}</p></div><ShieldCheck size={28} aria-hidden="true" /></div><div className="mt-8 grid gap-4 border-t border-primary-foreground/20 pt-4 text-sm sm:grid-cols-2"><div><p className="text-primary-foreground/65">Submitted</p><p className="font-semibold">{new Date(application.createdAt).toLocaleDateString('en-IN')}</p></div><div><p className="text-primary-foreground/65">Current status</p><p className="font-semibold">{statusLabel}</p></div></div></div>
      <div className="border border-slate-300 bg-card p-6 shadow-sm"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center bg-amber-100 text-amber-700"><Clock3 size={20} /></span><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Review state</p><h2 className="font-serif text-xl font-bold">{statusLabel}</h2></div></div><p className="mt-5 text-sm leading-6 text-muted-foreground">{approved ? 'Your application has been approved. Published CET documents will appear below.' : 'Your application is being processed. Official documents remain unavailable until published.'}</p></div>
    </section>
    <section><div className="mb-3 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Official documents</p><h2 className="font-serif text-2xl font-bold">Hall Ticket &amp; Score Card</h2></div><FileText className="text-muted-foreground" aria-hidden="true" /></div><div className="grid gap-4 md:grid-cols-2">{visibility.hallTicket && <CetDocumentCard kind="hall-ticket" applicationNumber={application.applicationNumber} available={visibility.hallTicket} />}{visibility.scoreCard && <CetDocumentCard kind="score-card" applicationNumber={application.applicationNumber} available={visibility.scoreCard} published={moduleSettings.score_card_published === true} />}{moduleSettings.score_card_enabled === true && !visibility.scoreCard && <CetDocumentCard kind="score-card" applicationNumber={application.applicationNumber} available={false} published={moduleSettings.score_card_published === true} />}</div>{moduleSettings.announcement_text && <p className="mt-4 border border-primary/20 bg-primary/5 p-4 text-sm leading-6">{moduleSettings.announcement_text}</p>}</section>
    <section className="border border-slate-300 bg-card p-6"><div className="mb-5 flex items-center gap-3"><CheckCircle2 className="text-emerald-600" /><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Submitted profile</p><h2 className="font-serif text-xl font-bold">Application snapshot</h2></div></div><div className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">{[['Full name', application.fullName], ['Date of birth', application.dob], ['Category', application.category], ['Gender', application.gender], ['Mobile', application.mobile], ['Email', application.email], ['District', application.district], ['State', application.state]].map(([label, value]) => <div key={label as string} className="border-b border-dashed border-slate-300 pb-2"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{display(value)}</p></div>)}</div></section>
    <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">CET Cell Student Services • Secure authenticated view</p>
  </div></main>;
}
