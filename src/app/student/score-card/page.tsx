'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CetDocumentSheet } from '@/components/student/CetDocumentSheet';

export default function ScoreCardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { const load = async () => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/student/login'); return; } const { data } = await supabase.from('applications').select('*').eq('user_id', user.id).maybeSingle(); if (!data) { router.replace('/student/dashboard'); return; } setApplication({ ...data.personal_data, ...data.academic_data, applicationNumber: data.application_number }); }; void load(); }, [router]);
  return application ? <CetDocumentSheet kind="score-card" application={application} /> : <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading document…</main>;
}
