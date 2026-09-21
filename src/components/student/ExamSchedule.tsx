'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, LockKeyhole, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Day = { id: string; day_number: number; title: string; scheduled_date: string; start_time: string; end_time: string; duration_minutes: number };
type Question = { id: string; question_number: number; prompt: string; options: string[]; marks: number };
type Attempt = { attempt_id: string; expires_at: string; status: string; started_at?: string };
const EXPECTED_DAY_QUESTION_COUNT = 50;

type ExamScheduleProps = { examId: string };

export function ExamSchedule({ examId }: ExamScheduleProps) {
  const client = createClient();
  const [days, setDays] = useState<Day[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [activeDay, setActiveDay] = useState<Day | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    const { data: dayRows } = await client.from('exam_days').select('id,day_number,title,scheduled_date,start_time,end_time,duration_minutes').eq('exam_id', examId).eq('is_published', true).order('day_number');
    setDays(dayRows ?? []);
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { data: application } = await client.from('applications').select('id').eq('user_id', user.id).maybeSingle();
    if (!application) return;
    const { data: attempts } = await client.from('exam_attempts').select('exam_day_id,status').eq('application_id', application.id).eq('exam_id', examId);
    setCompleted((attempts ?? []).filter((row: { status: string }) => ['submitted', 'completed', 'expired'].includes(row.status)).map((row: { exam_day_id: string }) => row.exam_day_id));
  };

  useEffect(() => { void load(); }, [examId]);
  useEffect(() => {
    if (!attempt) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((new Date(attempt.expires_at).getTime() - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [attempt]);

  const formattedTime = useMemo(() => `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`, [secondsLeft]);
  const startDay = async (day: Day) => {
    setMessage('');
    setActiveDay(day);
    const { data: { user } } = await client.auth.getUser();
    if (!user) return setMessage('Please sign in again.');
    const { data: application } = await client.from('applications').select('id').eq('user_id', user.id).maybeSingle();
    if (!application) return setMessage('A valid application is required before starting.');
    const { data, error } = await client.rpc('start_exam_day', { p_exam_day_id: day.id, p_application_id: application.id });
    if (error) return setMessage(error.message);
    const nextAttempt = data as Attempt;
    if (nextAttempt.status === 'submitted') {
      setActiveDay(null);
      return setMessage('This exam day has already been submitted. No second attempt is allowed.');
    }
    if (!examId) return setMessage('The CET examination is not available.');
    const { data: questionRows, error: questionError } = await client.from('exam_questions').select('id,question_number,prompt,options,marks').eq('exam_id', examId).eq('day_id', day.id).order('question_number').limit(EXPECTED_DAY_QUESTION_COUNT);
    if (questionError) return setMessage(questionError.message);
    const dayQuestions = (questionRows ?? []) as Question[];
    if (dayQuestions.length !== EXPECTED_DAY_QUESTION_COUNT) return setMessage(`Day ${day.day_number} is not ready: expected 50 assigned questions, found ${dayQuestions.length}.`);
    setQuestions(dayQuestions);
    const { data: savedAnswers, error: answersError } = await client.from('exam_answers').select('question_id,selected_option').eq('attempt_id', nextAttempt.attempt_id);
    if (answersError) return setMessage(`Unable to restore saved answers: ${answersError.message}`);
    setAnswers(Object.fromEntries((savedAnswers ?? []).filter((answer: { question_id: string; selected_option: string | null }) => answer.selected_option).map((answer: { question_id: string; selected_option: string | null }) => [answer.question_id, answer.selected_option as string])));
    setAttempt(nextAttempt);
  };
  const saveAnswer = async (questionId: string, option: string) => {
    if (!attempt) return;
    setAnswers((current) => ({ ...current, [questionId]: option }));
    const { error } = await client.rpc('save_exam_answer', { p_attempt_id: attempt.attempt_id, p_question_id: questionId, p_selected_option: option, p_marked_for_review: false });
    if (error) setMessage(error.message);
  };
  const submit = async () => {
    if (!attempt) return;
    const { data, error } = await client.rpc('submit_exam_attempt', { p_attempt_id: attempt.attempt_id });
    if (error) return setMessage(error.message);
    setMessage(`Day submitted. Score: ${data.score}/${data.total_marks}.`);
    setCompleted((current) => activeDay?.id && !current.includes(activeDay.id) ? current.concat(activeDay.id) : current);
    setAttempt(null);
    setActiveDay(null);
    setQuestions([]);
    setAnswers({});
    await load();
  };
  return <section className="border border-slate-300 bg-card p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Linux CS Entrance Examination 2026</p><h2 className="mt-1 font-serif text-2xl font-bold">Six-day examination schedule</h2><p className="mt-2 text-sm text-muted-foreground">Each day is a separate 50-question, 50-mark attempt.</p></div><CalendarDays className="text-primary" /></div>
    {message && <p className="mt-4 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
    {!attempt && <div className="mt-5 grid gap-3">{days.map((day) => { const isCompleted = completed.includes(day.id); const available = day.scheduled_date === today && !isCompleted; const past = day.scheduled_date < today; return <article key={day.id} className="flex flex-col gap-4 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3">{isCompleted ? <CheckCircle2 className="mt-1 text-emerald-600" size={20} /> : available ? <Clock3 className="mt-1 text-primary" size={20} /> : <LockKeyhole className="mt-1 text-slate-400" size={20} />}<div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Day {day.day_number}</p><h3 className="font-semibold">{day.title}</h3><p className="mt-1 text-sm text-muted-foreground">{new Date(`${day.scheduled_date}T00:00:00`).toLocaleDateString('en-IN')} · {day.start_time.slice(0, 5)}–{day.end_time.slice(0, 5)} · {day.duration_minutes} minutes</p></div></div>{isCompleted ? <span className="text-sm font-semibold text-emerald-700">Completed</span> : available ? <button onClick={() => void startDay(day)} className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Start Examination</button> : <span className="text-sm font-semibold text-slate-500">{past ? 'Unavailable' : 'Upcoming'}</span>}</article>; })}</div>}
    {attempt && activeDay && <div className="mt-6"><div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-4"><div><p className="font-semibold">Day {activeDay.day_number}: {activeDay.title}</p><p className="text-xs text-muted-foreground">{questions.length} questions · {questions.reduce((sum, question) => sum + question.marks, 0)} marks · {activeDay.duration_minutes} minutes</p></div><span className="font-semibold">Time remaining: <span className={secondsLeft < 300 ? 'text-red-600' : 'text-primary'}>{formattedTime}</span></span><button onClick={() => void submit()} className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Send size={15} />Submit Day</button></div><div className="mt-4 grid gap-4">{questions.map((question, index) => <article key={question.id} className="border border-slate-200 p-4"><p className="text-sm font-semibold">{index + 1}. {question.prompt}</p><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => { const key = String.fromCharCode(65 + optionIndex); return <label key={key} className={`flex cursor-pointer gap-3 border p-3 text-sm ${answers[question.id] === key ? 'border-primary bg-primary/5' : 'border-slate-200'}`}><input type="radio" name={question.id} checked={answers[question.id] === key} onChange={() => void saveAnswer(question.id, key)} /> <span><b>{key}.</b> {option}</span></label>; })}</div></article>)}</div></div>}
  </section>;
}
