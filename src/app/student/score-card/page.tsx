'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CetDocumentSheet } from '@/components/student/CetDocumentSheet';

const parseSettingValue = (value: unknown): boolean | string => {
  if (typeof value === 'boolean' || typeof value === 'string') return value;
  return String(value ?? '').replaceAll('"', '');
};

export default function ScoreCardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  const [state, setState] = useState<'loading' | 'unavailable' | 'not-published' | 'ready'>('loading');
  useEffect(() => { const load = async () => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/student/login'); return; } const { data: settingRows } = await supabase.from('module_settings').select('key, value').in('key', ['score_card_enabled', 'score_card_published']); const settings = Object.fromEntries((settingRows ?? []).map((row) => [row.key, parseSettingValue(row.value)])); if (settings.score_card_enabled !== true) { setState('unavailable'); return; } if (settings.score_card_published !== true) { setState('not-published'); return; } const { data } = await supabase.from('applications').select('*').eq('user_id', user.id).maybeSingle(); if (!data) { router.replace('/student/dashboard'); return; } setApplication({ ...data.personal_data, ...data.academic_data, applicationNumber: data.application_number }); setState('ready'); }; void load(); }, [router]);
  if (state === 'unavailable') return <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"><h1 className="font-serif text-2xl font-bold">Score Card is currently unavailable</h1><p className="text-sm text-muted-foreground">The CET Cell has not enabled this module yet.</p><button onClick={() => router.replace('/student/dashboard')} className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to dashboard</button></main>;
  if (state === 'not-published') return <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"><h1 className="font-serif text-2xl font-bold">Score Card is not published</h1><p className="text-sm text-muted-foreground">The score card will appear here after publication.</p><button onClick={() => router.replace('/student/dashboard')} className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to dashboard</button></main>;
  return state === 'ready' && application ? <CetDocumentSheet kind="score-card" application={application} /> : <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading document…</main>;
}
