'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Attempt = { id: string; exam_id: string; application_id: string; user_id: string; started_at: string; expires_at: string; submitted_at: string | null; score: number; total_marks: number; status: string; exams?: { code: string; title: string }[] | null };

export function ExamSubmissionsPanel() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const load = async () => {
    setLoading(true);
    const { data, error } = await createClient().from('exam_attempts').select('id,exam_id,application_id,user_id,started_at,expires_at,submitted_at,score,total_marks,status,exams(code,title)').order('started_at', { ascending: false });
    if (error) setNotice(`Unable to load submissions: ${error.message}`);
    setAttempts((data ?? []) as Attempt[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  return <section className="border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-slate-400">Evaluation queue</p><h2 className="text-2xl font-bold text-[#092f52]">Exam Submissions</h2></div><button onClick={() => void load()} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-semibold"><RefreshCw size={15} />Refresh</button></div>{notice && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{notice}</p>}{loading ? <p className="mt-6 text-sm text-slate-500">Loading submissions…</p> : attempts.length === 0 ? <p className="mt-6 border-t border-dashed border-slate-300 pt-5 text-sm text-slate-500">No exam submissions yet.</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-400"><th className="px-3 py-3">Exam</th><th className="px-3 py-3">Application</th><th className="px-3 py-3">Student</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Submitted</th></tr></thead><tbody>{attempts.map((attempt) => <tr key={attempt.id} className="border-b border-slate-100"><td className="px-3 py-4"><p className="font-semibold">{attempt.exams?.[0]?.title ?? 'Exam'}</p><p className="text-xs text-slate-500">{attempt.exams?.[0]?.code ?? attempt.exam_id}</p></td><td className="px-3 py-4 font-mono text-xs">{attempt.application_id}</td><td className="px-3 py-4 font-mono text-xs">{attempt.user_id}</td><td className="px-3 py-4 font-semibold">{attempt.score}/{attempt.total_marks}</td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{attempt.status}</span></td><td className="px-3 py-4 text-xs text-slate-500">{attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '—'}</td></tr>)}</tbody></table></div>}</section>;
}
