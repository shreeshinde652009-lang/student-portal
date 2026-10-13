'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type CapCycle = { id?: string; name: string; registration_opens_at: string; registration_closes_at: string; option_form_opens_at: string; option_form_closes_at: string; is_active: boolean };

const emptyCycle: CapCycle = { name: 'CAP 2026', registration_opens_at: '', registration_closes_at: '', option_form_opens_at: '', option_form_closes_at: '', is_active: false };
const toInputDate = (value?: string | null) => value ? new Date(value).toISOString().slice(0, 16) : '';
const toIso = (value: string) => value ? new Date(value).toISOString() : null;

export function CapCycleSettings() {
  const [cycle, setCycle] = useState<CapCycle>(emptyCycle);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data, error: dbError } = await createClient().from('cap_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (dbError) setError('Unable to load CAP cycle settings.');
      else if (data) setCycle({ ...data, registration_opens_at: toInputDate(data.registration_opens_at), registration_closes_at: toInputDate(data.registration_closes_at), option_form_opens_at: toInputDate(data.option_form_opens_at), option_form_closes_at: toInputDate(data.option_form_closes_at) });
      setLoading(false);
    };
    void load();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    const payload = { name: cycle.name.trim(), registration_opens_at: toIso(cycle.registration_opens_at), registration_closes_at: toIso(cycle.registration_closes_at), option_form_opens_at: toIso(cycle.option_form_opens_at), option_form_closes_at: toIso(cycle.option_form_closes_at), is_active: cycle.is_active, updated_at: new Date().toISOString() };
    const client = createClient();
    const result = cycle.id ? await client.from('cap_settings').update(payload).eq('id', cycle.id).select().single() : await client.from('cap_settings').insert(payload).select().single();
    if (result.error) setError('Unable to save CAP cycle. Confirm your admin access.');
    else { setCycle({ ...cycle, id: result.data.id }); setMessage('CAP cycle saved. Student access now follows the active cycle and Admin toggle.'); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} />Loading CAP cycle settings…</div>;
  return <div className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-amber-700">CAP operations</p><h3 className="mt-1 text-xl font-bold text-[#092f52]">CAP cycle configuration</h3><p className="mt-1 text-sm text-slate-500">Create or edit the active cycle required by student CAP registration. The module toggle above remains the final access control.</p><form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-semibold md:col-span-2">Cycle name<input required value={cycle.name} onChange={(event) => setCycle({ ...cycle, name: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>{[['registration_opens_at','Registration opens'],['registration_closes_at','Registration closes'],['option_form_opens_at','Option form opens'],['option_form_closes_at','Option form closes']].map(([key,label]) => <label key={key} className="grid gap-1 text-sm font-semibold">{label}<input required type="datetime-local" value={cycle[key as keyof CapCycle] as string} onChange={(event) => setCycle({ ...cycle, [key]: event.target.value })} className="rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>)}<label className="flex items-center gap-2 text-sm font-semibold md:col-span-2"><input type="checkbox" checked={cycle.is_active} onChange={(event) => setCycle({ ...cycle, is_active: event.target.checked })} />Make this the active CAP cycle</label>{error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}{message && <p className="flex items-center gap-2 text-sm text-emerald-700 md:col-span-2"><CheckCircle2 size={16} />{message}</p>}<button disabled={saving} className="w-fit rounded-md bg-[#092f52] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" type="submit">{saving ? 'Saving…' : 'Save CAP cycle'}</button></form></div>;
}

export default CapCycleSettings;
