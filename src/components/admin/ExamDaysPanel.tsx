'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type ExamDay = { id: string; day_number: number; title: string; scheduled_date: string; start_time: string; end_time: string; duration_minutes: number; is_published: boolean; question_count: number; total_marks: number };
type ExamDayRow = Omit<ExamDay, 'question_count' | 'total_marks'> & { exam_questions: Array<{ marks: number }> | null };

export function ExamDaysPanel() {
  const [days, setDays] = useState<ExamDay[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const client = createClient();
  const load = async () => {
    const { data: exam } = await client.from('exams').select('id,title,code').eq('code', 'CET-2026').maybeSingle();
    if (!exam) { setNotice('CET-2026 exam was not found.'); setLoading(false); return; }
    const { data } = await client.from('exam_days').select('id,day_number,title,scheduled_date,start_time,end_time,duration_minutes,is_published,exam_questions(marks)').eq('exam_id', exam.id).order('day_number');
    setDays((data ?? []).map((day: ExamDayRow) => ({ ...day, question_count: day.exam_questions?.length ?? 0, total_marks: (day.exam_questions ?? []).reduce((sum, question) => sum + Number(question.marks || 0), 0) })));
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const update = async (day: ExamDay, patch: Partial<ExamDay>) => {
    setNotice('');
    const { error } = await client.from('exam_days').update({ scheduled_date: patch.scheduled_date, start_time: patch.start_time, end_time: patch.end_time, duration_minutes: patch.duration_minutes }).eq('id', day.id);
    if (error) setNotice(error.message); else { setNotice(`Day ${day.day_number} schedule saved.`); await load(); }
  };
  if (loading) return <section className="border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading six-day schedule…</section>;
  return <section className="mb-6 border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8a317]">CET-2026 schedule</p><h2 className="mt-1 text-2xl font-bold text-[#092f52]">Six-day examination plan</h2><p className="mt-1 text-sm text-slate-500">Each day has its own 50-question, 50-mark attempt.</p></div><CalendarDays className="text-[#092f52]" /></div>{notice && <p className="mt-4 border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}<div className="mt-5 grid gap-3">{days.map((day) => <div key={day.id} className="grid gap-3 border border-slate-200 p-4 lg:grid-cols-[auto_1fr_140px_100px_100px_auto] lg:items-end"><div><p className="text-xs font-semibold uppercase text-slate-400">Day {day.day_number}</p><p className="font-semibold text-[#092f52]">{day.title}</p></div><div className="text-sm text-slate-600">{day.question_count} questions · {day.total_marks} marks</div><label className="text-xs font-semibold text-slate-600">Date<input type="date" value={day.scheduled_date} onChange={(event) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, scheduled_date: event.target.value } : item))} className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm" /></label><label className="text-xs font-semibold text-slate-600">Start<input type="time" value={day.start_time.slice(0, 5)} onChange={(event) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, start_time: event.target.value } : item))} className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm" /></label><label className="text-xs font-semibold text-slate-600">Minutes<input type="number" min="1" max="600" value={day.duration_minutes} onChange={(event) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, duration_minutes: Number(event.target.value) } : item))} className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm" /></label><button onClick={() => update(day, day)} className="inline-flex items-center justify-center gap-2 bg-[#092f52] px-3 py-2 text-sm font-semibold text-white"><Save size={15} />Save</button></div>)}</div></section>;
}
