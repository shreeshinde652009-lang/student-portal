'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Course = { id: string; name: string; code: string; college_id: string; colleges?: { name: string; code: string } | { name: string; code: string }[] | null };
const getCollegeName = (course: Course) => Array.isArray(course.colleges) ? course.colleges[0]?.name : course.colleges?.name;
type Choice = Course & { preference_rank: number };
type ExistingOption = { preference_rank: number; courses: Course | Course[] | null };

export function CapRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [deadline, setDeadline] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/student/login'); return; }
      const [{ data: moduleSetting }, { data: setting }, { data: applications }, { data: courseRows }] = await Promise.all([
        supabase.from('module_settings').select('value').eq('key', 'cap_registration_enabled').maybeSingle(),
        supabase.from('cap_settings').select('id, option_form_closes_at').eq('is_active', true).maybeSingle(),
        supabase.from('applications').select('id, status').eq('user_id', user.id).eq('status', 'APPROVED').limit(1),
        supabase.from('courses').select('id, name, code, college_id, colleges(name, code)').eq('status', 'active').order('name'),
      ]);
      const capEnabled = moduleSetting?.value === true || moduleSetting?.value === 'true';
      if (!capEnabled) { setError('CAP Registration is currently disabled by the CET Cell.'); setLoading(false); return; }
      if (!setting) { setError('CAP registration is not currently open.'); setLoading(false); return; }
      if (!applications?.[0]) { setError('CAP registration is available only after your application is approved by the CET Cell.'); setLoading(false); return; }
      setApplicationId(applications[0].id); setDeadline(setting.option_form_closes_at); setCourses((courseRows ?? []) as Course[]);
      const { data: existing } = await supabase.from('cap_registrations').select('id, status, cap_options(id, course_id, preference_rank, courses(id, name, code, college_id, colleges(name, code)))').eq('application_id', applications[0].id).maybeSingle();
      if (existing) { setRegistrationId(existing.id); setSubmitted(existing.status === 'submitted' || existing.status === 'locked'); const existingChoices = ((existing.cap_options ?? []) as ExistingOption[]).sort((a, b) => a.preference_rank - b.preference_rank).flatMap((item) => { const course = Array.isArray(item.courses) ? item.courses[0] : item.courses; return course ? [{ ...course, preference_rank: item.preference_rank }] : []; }); setChoices(existingChoices); }
      setLoading(false);
    };
    void load();
  }, [router]);

  const available = useMemo(() => courses.filter((course) => !choices.some((choice) => choice.id === course.id)), [courses, choices]);
  const addChoice = (courseId: string) => { if (choices.length >= 20) return; const course = courses.find((item) => item.id === courseId); if (course) setChoices((items) => [...items, { ...course, preference_rank: items.length + 1 }]); };
  const removeChoice = (id: string) => setChoices((items) => items.filter((item) => item.id !== id).map((item, index) => ({ ...item, preference_rank: index + 1 })));

  const save = async (finalize: boolean) => {
    if (!applicationId || choices.length === 0) { setError('Add at least one course preference before saving.'); return; }
    setSaving(true); setError('');
    const supabase = createClient();
    let currentRegistrationId = registrationId;
    if (!currentRegistrationId) { const { data, error: registrationError } = await supabase.from('cap_registrations').insert({ application_id: applicationId, cap_setting_id: (await supabase.from('cap_settings').select('id').eq('is_active', true).single()).data?.id, status: finalize ? 'submitted' : 'draft', submitted_at: finalize ? new Date().toISOString() : null }).select('id').single(); if (registrationError) { setError('Unable to create your CAP registration.'); setSaving(false); return; } currentRegistrationId = data.id; setRegistrationId(data.id); }
    await supabase.from('cap_options').delete().eq('registration_id', currentRegistrationId);
    const { error: optionsError } = await supabase.from('cap_options').insert(choices.map((choice, index) => ({ registration_id: currentRegistrationId, course_id: choice.id, preference_rank: index + 1 })));
    if (optionsError) setError('Unable to save preferences.'); else { if (finalize) { await supabase.from('cap_registrations').update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', currentRegistrationId); setSubmitted(true); } }
    setSaving(false);
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Loading CAP registration…</main>;
  return <main className="min-h-screen bg-muted px-4 py-8"><div className="mx-auto flex max-w-4xl flex-col gap-6"><button onClick={() => router.push('/student/dashboard')} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft />Back to dashboard</button><section className="border border-slate-300 bg-card p-6 shadow-sm md:p-8"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Student services · CAP 2026</p><h1 className="mt-2 font-serif text-3xl font-bold">CAP Registration &amp; Option Form</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Rank up to 20 approved college and course preferences. Your order will be used for allotment.</p>{deadline && <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Option form closes {new Date(deadline).toLocaleString()}</p>}</section>{error && <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle />{error}</div>}{submitted ? <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><CheckCircle2 /><div><p className="font-semibold">Option form submitted</p><p className="mt-1 text-sm">Your preferences are locked for CET Cell processing.</p></div></div> : <section className="border border-slate-200 bg-card p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Your preferences</h2><p className="text-sm text-muted-foreground">{choices.length} of 20 options selected</p></div><select aria-label="Add course preference" value="" onChange={(event) => addChoice(event.target.value)} disabled={available.length === 0 || choices.length >= 20} className="border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">Add college/course</option>{available.map((course) => <option key={course.id} value={course.id}>{getCollegeName(course) ?? 'College'} · {course.name}</option>)}</select></div><div className="mt-5 flex flex-col gap-2">{choices.map((choice, index) => <div key={choice.id} className="flex items-center gap-3 border border-slate-200 p-3"><span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{choice.name}</p><p className="text-xs text-muted-foreground">{getCollegeName(choice) ?? 'Approved college'} · {choice.code}</p></div><button onClick={() => removeChoice(choice.id)} className="text-red-600" aria-label={`Remove ${choice.name}`}><Trash2 /></button></div>)}{choices.length === 0 && <p className="border border-dashed border-slate-300 p-8 text-center text-sm text-muted-foreground">Add your first course preference above.</p>}</div><div className="mt-6 flex flex-wrap gap-3"><button disabled={saving || choices.length === 0} onClick={() => void save(false)} className="inline-flex items-center gap-2 border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50"><Save />Save draft</button><button disabled={saving || choices.length === 0} onClick={() => void save(true)} className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Plus />Submit option form</button></div></section>}</div></main>;
}

export default CapRegistration;
