'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Exam = { id: string; title: string; description: string | null; duration_minutes: number; total_marks: number; is_published: boolean };
type Question = { id?: string; question_text: string; options: string[]; correct_option: string; marks: number; sort_order: number };

const emptyQuestion = (): Question => ({ question_text: '', options: ['', '', '', ''], correct_option: '', marks: 1, sort_order: 0 });

export function ExamAdminPanel() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selected, setSelected] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await createClient().from('exams').select('id,title,description,duration_minutes,total_marks,is_published').order('created_at', { ascending: false });
    setExams(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const selectExam = async (exam: Exam) => {
    setSelected(exam); setTitle(exam.title); setDescription(exam.description ?? ''); setDuration(String(exam.duration_minutes));
    const { data } = await createClient().from('exam_questions').select('id,question_text,options,correct_option,marks,sort_order').eq('exam_id', exam.id).order('sort_order');
    setQuestions((data ?? []).map((item) => ({ ...item, options: Array.isArray(item.options) ? item.options as string[] : [] })));
  };

  const saveExam = async (publish?: boolean) => {
    setNotice('');
    const client = createClient();
    const payload = { title: title.trim(), description: description.trim() || null, duration_minutes: Math.max(1, Number(duration) || 60), total_marks: questions.reduce((sum, question) => sum + Math.max(1, Number(question.marks) || 1), 0), is_published: publish ?? selected?.is_published ?? false, updated_at: new Date().toISOString() };
    if (!payload.title) { setNotice('Enter an exam title.'); return; }
    const result = selected ? await client.from('exams').update(payload).eq('id', selected.id).select().single() : await client.from('exams').insert(payload).select().single();
    if (result.error || !result.data) { setNotice(result.error?.message ?? 'Unable to save exam.'); return; }
    const exam = result.data as Exam;
    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      const questionPayload = { exam_id: exam.id, question_text: question.question_text.trim(), options: question.options, correct_option: question.correct_option, marks: Math.max(1, Number(question.marks) || 1), sort_order: index };
      if (question.id) await client.from('exam_questions').update(questionPayload).eq('id', question.id);
      else if (question.question_text.trim()) await client.from('exam_questions').insert(questionPayload);
    }
    setNotice(publish ? 'Exam published.' : 'Exam saved as draft.'); setSelected(exam); await load();
  };

  if (loading) return <p className="text-sm text-slate-500">Loading exams…</p>;
  return <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
    <section className="border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-[#092f52]">Exams</h2><button onClick={() => { setSelected(null); setTitle(''); setDescription(''); setDuration('60'); setQuestions([emptyQuestion()]); }} className="bg-[#092f52] px-3 py-2 text-xs font-semibold text-white">New exam</button></div><div className="mt-4 grid gap-2">{exams.map((exam) => <button key={exam.id} onClick={() => void selectExam(exam)} className={`border p-3 text-left ${selected?.id === exam.id ? 'border-[#e8a317] bg-amber-50' : 'border-slate-200'}`}><p className="font-semibold">{exam.title}</p><p className="mt-1 text-xs text-slate-500">{exam.is_published ? 'Published' : 'Draft'} · {exam.total_marks} marks</p></button>)}{exams.length === 0 && <p className="text-sm text-slate-500">No exams created.</p>}</div></section>
    <section className="border border-slate-200 bg-white p-5"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold">Exam title<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Duration (minutes)<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label></div><label className="mt-4 block text-sm font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-20 w-full border border-slate-300 px-3 py-2 font-normal" /></label><div className="mt-6 flex items-center justify-between"><h3 className="font-bold text-[#092f52]">Questions</h3><button onClick={() => setQuestions((items) => [...items, emptyQuestion()])} className="border border-slate-300 px-3 py-2 text-xs font-semibold">Add question</button></div><div className="mt-3 grid gap-4">{questions.map((question, index) => <div key={question.id ?? index} className="border border-slate-200 p-4"><label className="text-sm font-semibold">Question {index + 1}<textarea value={question.question_text} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, question_text: event.target.value } : item))} className="mt-1 min-h-16 w-full border border-slate-300 px-3 py-2 font-normal" /></label><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <input key={optionIndex} value={option} placeholder={`Option ${optionIndex + 1}`} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, options: item.options.map((value, currentIndex) => currentIndex === optionIndex ? event.target.value : value) } : item))} className="border border-slate-300 px-3 py-2 text-sm" />)}</div><div className="mt-3 flex flex-wrap gap-2"><select value={question.correct_option} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, correct_option: event.target.value } : item))} className="border border-slate-300 px-3 py-2 text-sm"><option value="">Correct option</option>{question.options.map((option, optionIndex) => <option key={optionIndex} value={option}>{option || `Option ${optionIndex + 1}`}</option>)}</select><input type="number" min="1" value={question.marks} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, marks: Number(event.target.value) } : item))} className="w-24 border border-slate-300 px-3 py-2 text-sm" /></div></div>)}</div><div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={() => void saveExam(false)} className="bg-[#092f52] px-4 py-2 text-sm font-semibold text-white">Save draft</button><button onClick={() => void saveExam(true)} className="bg-[#e8a317] px-4 py-2 text-sm font-semibold text-[#092f52]">Publish exam</button>{notice && <p className="text-sm text-slate-600">{notice}</p>}</div></section>
  </div>;
}
