'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CetDocumentSheet } from '@/components/student/CetDocumentSheet';

const parseSettingValue = (value: unknown): boolean | string => {
  if (typeof value === 'boolean' || typeof value === 'string') return value;
  return String(value ?? '').replaceAll('"', '');
};

export default function HallTicketPage() {
  const router = useRouter();
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  const [state, setState] = useState<'loading' | 'unavailable' | 'ready'>('loading');
  useEffect(() => { const load = async () => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/student/login'); return; } const { data: settingRows } = await supabase.from('module_settings').select('key, value').eq('key', 'hall_ticket_enabled').maybeSingle(); if (parseSettingValue(settingRows?.value) !== true) { setState('unavailable'); return; } const { data } = await supabase.from('applications').select('*').eq('user_id', user.id).maybeSingle(); if (!data) { router.replace('/student/dashboard'); return; } const { data: hallTicket, error: hallTicketError } = await supabase.from('hall_ticket_details').select('*').eq('application_id', data.id).eq('status', 'published').maybeSingle(); if (hallTicketError || !hallTicket) { setState('unavailable'); return; } setApplication({ ...data.personal_data, ...data.academic_data, ...hallTicket, fullName: hallTicket.candidate_name, applicationNumber: hallTicket.application_number || data.application_number }); setState('ready'); }; void load(); }, [router]);
  if (state === 'unavailable') return <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"><h1 className="font-serif text-2xl font-bold">Hall Ticket is currently unavailable</h1><p className="text-sm text-muted-foreground">The CET Cell has not enabled this module yet.</p><button onClick={() => router.replace('/student/dashboard')} className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to dashboard</button></main>;
  return state === 'ready' && application ? <CetDocumentSheet kind="hall-ticket" application={application} /> : <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading document…</main>;
}
