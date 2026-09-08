'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Exam = { id: string; title: string; description: string | null; duration_minutes: number; total_marks: number; starts_at: string | null; ends_at: string | null };

export default function ExaminationPage() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'disabled' | 'empty' | 'ready'>('loading');
  const [exams, setExams] = useState<Exam[]>([]);
  useEffect(() => { const load = async () => { const client = createClient(); const { data: { user } } = await client.auth.getUser(); if (!user) { router.replace('/student/login'); return; } const { data: setting } = await client.from('module_settings').select('value').eq('key', 'exam_enabled').maybeSingle(); if (setting?.value !== true) { setState('disabled'); return; } const { data } = await client.from('exams').select('id,title,description,duration_minutes,total_marks,starts_at,ends_at').eq('is_published', true).order('starts_at', { ascending: true, nullsFirst: false }); setExams(data ?? []); setState(data?.length ? 'ready' : 'empty'); }; void load(); }, [router]);
  if (state === 'loading') return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 animate-spin" size={18} />Loading examinations…</main>;
  return <main className="min-h-screen bg-muted px-4 py-10"><div className="mx-auto flex max-w-4xl flex-col gap-6"><button onClick={() => router.push('/student/dashboard')} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} />Back to dashboard</button><section className="border border-slate-300 bg-card p-8"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Student services</p><h1 className="mt-2 font-serif text-3xl font-bold">Examination</h1><p className="mt-3 leading-6 text-muted-foreground">Published CET examinations and eligibility details.</p>{state === 'disabled' && <p className="mt-8 border-t border-dashed border-slate-300 pt-5 text-sm text-muted-foreground">This module is currently disabled by the CET Cell.</p>}{state === 'empty' && <p className="mt-8 border-t border-dashed border-slate-300 pt-5 text-sm text-muted-foreground">No published examinations are available yet.</p>}{state === 'ready' && <div className="mt-8 grid gap-4">{exams.map((exam) => <article key={exam.id} className="border border-slate-200 p-5"><div className="flex items-start gap-3"><BookOpen className="mt-1 text-primary" size={20} /><div><h2 className="font-bold">{exam.title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{exam.description || 'Official CET examination.'}</p><p className="mt-3 text-xs text-muted-foreground">Duration: {exam.duration_minutes} minutes · Total marks: {exam.total_marks}{exam.starts_at ? ` · Starts ${new Date(exam.starts_at).toLocaleString()}` : ''}</p></div></div></article>)}</div>}</section></div></main>;
}
