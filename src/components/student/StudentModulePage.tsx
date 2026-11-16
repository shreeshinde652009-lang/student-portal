'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { AlertCircle, ArrowLeft, FileText, LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type ModuleTable = 'cap_registrations' | 'documents' | 'notices' | 'results';
type StudentRecord = Record<string, unknown>;
type ModuleResult = {
  authenticated: boolean;
  enabled: boolean;
  records: StudentRecord[];
};
type StudentModulePageProps = {
  settingKey: string;
  title: string;
  description: string;
  tableName: ModuleTable;
};

function settingEnabled(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  const normalized = value.replaceAll('"', '').trim().toLowerCase();
  return normalized === 'true';
}

async function loadModule(settingKey: string, tableName: ModuleTable): Promise<ModuleResult> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return { authenticated: false, enabled: false, records: [] };

  const { data: setting, error: settingError } = await supabase
    .from('module_settings')
    .select('value')
    .eq('key', settingKey)
    .maybeSingle();
  if (settingError) throw settingError;
  if (!settingEnabled(setting?.value)) return { authenticated: true, enabled: false, records: [] };

  if (tableName === 'notices') {
    const { data, error } = await supabase
      .from('announcements')
      .select('id,title,body,published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error) throw error;
    return { authenticated: true, enabled: true, records: (data ?? []) as StudentRecord[] };
  }

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (applicationError) throw applicationError;
  if (!application) return { authenticated: true, enabled: true, records: [] };

  if (tableName === 'documents') {
    const { data, error } = await supabase
      .from('documents')
      .select('id,document_type,file_name,mime_type,file_size,verification_status,created_at')
      .eq('application_id', application.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { authenticated: true, enabled: true, records: (data ?? []) as StudentRecord[] };
  }

  if (tableName === 'results') {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('id,exam_id,exam_day_id,score,total_marks,status,submitted_at')
      .eq('application_id', application.id)
      .eq('result_published', true)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return { authenticated: true, enabled: true, records: (data ?? []) as StudentRecord[] };
  }

  const { data, error } = await supabase
    .from('cap_registrations')
    .select('id,status,submitted_at,created_at')
    .eq('application_id', application.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { authenticated: true, enabled: true, records: (data ?? []) as StudentRecord[] };
}

function formatDate(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function getRecordDetails(tableName: ModuleTable, record: StudentRecord) {
  if (tableName === 'notices') {
    return {
      heading: String(record.title || 'Official notice'),
      body: String(record.body || ''),
      detail: formatDate(record.published_at),
    };
  }
  if (tableName === 'documents') {
    return {
      heading: String(record.document_type || 'Application document').replaceAll('_', ' '),
      body: String(record.file_name || 'File details unavailable'),
      detail: record.verification_status ? `Review status: ${String(record.verification_status).replaceAll('_', ' ')}` : '',
    };
  }
  if (tableName === 'results') {
    const score = record.score == null ? 'Pending' : `${String(record.score)} / ${String(record.total_marks ?? '—')}`;
    return {
      heading: `Published result · ${score}`,
      body: `Attempt status: ${String(record.status || '—').replaceAll('_', ' ')}`,
      detail: formatDate(record.submitted_at),
    };
  }
  return {
    heading: 'CAP registration',
    body: `Registration status: ${String(record.status || 'draft').replaceAll('_', ' ')}`,
    detail: formatDate(record.submitted_at || record.created_at),
  };
}

export function StudentModulePage({ settingKey, title, description, tableName }: StudentModulePageProps) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<ModuleResult, Error>(
    ['student-module', settingKey, tableName],
    ([, key, table]) => loadModule(String(key), table as ModuleTable),
  );

  useEffect(() => {
    if (data && !data.authenticated) router.replace('/student/login');
  }, [data, router]);

  if (isLoading || (!data && !error)) {
    return <main className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" />Loading {title.toLowerCase()}…</main>;
  }

  if (data && !data.authenticated) {
    return <main className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Redirecting to sign in…</main>;
  }

  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="border-b border-slate-300 pb-5">
          <Link href="/student/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} aria-hidden="true" />Back to dashboard</Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Maharashtra CET Cell / Student Portal</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </header>

        {error && <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>We couldn&apos;t load this section. Please refresh or try again later.</p></div>}
        {data && !data.enabled && <div role="status" className="border border-slate-300 bg-card p-6"><h2 className="font-serif text-xl font-bold">This section is currently unavailable</h2><p className="mt-2 text-sm text-muted-foreground">The CET Cell has not enabled this module yet.</p></div>}
        {data?.enabled && !error && data.records.length === 0 && <div className="border border-slate-300 bg-card p-8 text-center"><FileText className="mx-auto text-muted-foreground" size={28} aria-hidden="true" /><h2 className="mt-3 font-serif text-xl font-bold">No records to show yet</h2><p className="mt-2 text-sm text-muted-foreground">Published updates and records for your account will appear here.</p></div>}
        {data?.enabled && !error && data.records.length > 0 && <section aria-label={`${title} records`} className="grid gap-3">{data.records.map((record, index) => {
          const details = getRecordDetails(tableName, record);
          return <article key={String(record.id ?? `${tableName}-${index}`)} className="border border-slate-300 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3"><FileText className="mt-1 shrink-0 text-primary" size={20} aria-hidden="true" /><div className="min-w-0"><h2 className="font-semibold capitalize">{details.heading}</h2>{details.body && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{details.body}</p>}{details.detail && <p className="mt-3 text-xs text-muted-foreground">{details.detail}</p>}</div></div>
          </article>;
        })}</section>}
      </div>
    </main>
  );
}
