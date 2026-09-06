'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type StudentModulePageProps = {
  settingKey: string;
  title: string;
  description: string;
  tableName: string;
};

export function StudentModulePage({ settingKey, title, description, tableName }: StudentModulePageProps) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'disabled' | 'empty' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/student/login'); return; }
      const { data: setting } = await supabase.from('module_settings').select('value').eq('key', settingKey).maybeSingle();
      if (setting?.value !== true) { setState('disabled'); return; }
      const { error } = await supabase.from(tableName).select('*').limit(1);
      if (error) {
        setState('empty');
        setMessage('This module is enabled, but no published student record is available yet.');
        return;
      }
      setState('ready');
      setMessage('Published records will appear here when available.');
    };
    void load();
  }, [router, settingKey, tableName]);

  if (state === 'loading') return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 animate-spin" size={18} />Loading module…</main>;
  return <main className="min-h-screen bg-muted px-4 py-10"><div className="mx-auto flex max-w-2xl flex-col gap-6"><button onClick={() => router.push('/student/dashboard')} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} />Back to dashboard</button><section className="border border-slate-300 bg-card p-8 shadow-sm"><div className="flex items-start gap-4"><span className={`flex size-11 shrink-0 items-center justify-center ${state === 'disabled' ? 'bg-slate-100 text-slate-500' : state === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{state === 'disabled' ? <AlertCircle size={22} /> : state === 'error' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}</span><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Student services</p><h1 className="mt-2 font-serif text-3xl font-bold">{title}</h1><p className="mt-3 leading-6 text-muted-foreground">{description}</p></div></div><p className="mt-8 border-t border-dashed border-slate-300 pt-5 text-sm leading-6 text-muted-foreground">{state === 'disabled' ? 'This module is currently disabled by the CET Cell.' : message}</p></section></div></main>;
}
