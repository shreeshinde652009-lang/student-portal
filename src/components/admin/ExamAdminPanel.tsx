'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Exam = { id: string; code: string; title: string; description: string | null; duration_minutes: number; total_marks: number; passing_marks: number; is_published: boolean };
const EXAM_SECTIONS = [
  { name: 'Computer MCQ', questionLimit: 125, markLimit: 125 },
  { name: 'General Knowledge', questionLimit: 125, markLimit: 125 },
  { name: 'Image Identification', questionLimit: 25, markLimit: 25 },
  { name: 'Computer Full Forms', questionLimit: 25, markLimit: 25 },
] as const;

type Question = { id?: string; question_number: number; section: string; category: string; difficulty: 'very_easy' | 'easy' | 'basic_thinking'; prompt: string; options: string[]; correct_option: string; marks: number };

const emptyQuestion = (questionNumber = 1, section = EXAM_SECTIONS[0].name): Question => ({ question_number: questionNumber, section, category: 'Computer Fundamentals', difficulty: 'very_easy', prompt: '', options: ['', '', '', ''], correct_option: '', marks: 1 });

export function ExamAdminPanel() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selected, setSelected] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [passingMarks, setPassingMarks] = useState('0');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await createClient().from('exams').select('id,code,title,description,duration_minutes,total_marks,passing_marks,is_published').order('created_at', { ascending: false });
    setExams(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const selectExam = async (exam: Exam) => {
    setSelected(exam); setCode(exam.code); setTitle(exam.title); setDescription(exam.description ?? ''); setDuration(String(exam.duration_minutes)); setPassingMarks(String(exam.passing_marks));
    const client = createClient();
    const { data, error } = await client.from('exam_questions').select('id,question_number,section,category,difficulty,prompt,options,correct_option,marks').eq('exam_id', exam.id).order('question_number');
    if (error) { setNotice(`Unable to load questions: ${error.message}`); setQuestions([]); return; }
    setQuestions((data ?? []).map((item) => ({ ...item, options: Array.isArray(item.options) ? item.options as string[] : [] })));
    if (!data?.length) setNotice('No saved questions found for this exam. Add a question and save.');
  };

  const saveExam = async (publish?: boolean) => {
    setNotice('');
    const client = createClient();
    const validQuestions = questions.filter((question) => question.prompt.trim() && question.options.filter((option) => option.trim()).length >= 2 && question.correct_option.trim() && EXAM_SECTIONS.some((section) => section.name === question.section));
    const totalMarks = validQuestions.reduce((sum, question) => sum + Math.max(1, Number(question.marks) || 1), 0);
    const sectionTotals = EXAM_SECTIONS.map((section) => ({ ...section, questions: validQuestions.filter((question) => question.section === section.name).length, marks: validQuestions.filter((question) => question.section === section.name).reduce((sum, question) => sum + Math.max(1, Number(question.marks) || 1), 0) }));
    const payload = { code: code.trim().toUpperCase(), title: title.trim(), description: description.trim() || null, duration_minutes: Math.min(600, Math.max(1, Number(duration) || 60)), total_marks: totalMarks, passing_marks: Math.min(totalMarks, Math.max(0, Number(passingMarks) || 0)), is_published: publish ?? selected?.is_published ?? false, updated_at: new Date().toISOString() };
    if (!payload.code) { setNotice('Enter a unique exam code.'); return; }
    if (!payload.title) { setNotice('Enter an exam title.'); return; }
    if (validQuestions.length === 0 || totalMarks <= 0) { setNotice('Add at least one complete question with a correct answer before saving.'); return; }
    const invalidSection = sectionTotals.find((section) => section.questions > section.questionLimit || section.marks > section.markLimit);
    if (invalidSection) { setNotice(`${invalidSection.name} allows ${invalidSection.questionLimit} questions and ${invalidSection.markLimit} marks.`); return; }
    const result = selected ? await client.from('exams').update(payload).eq('id', selected.id).select().single() : await client.from('exams').insert(payload).select().single();
    if (result.error || !result.data) { setNotice(result.error?.message ?? 'Unable to save exam.'); return; }
    const exam = result.data as Exam;
    for (let index = 0; index < validQuestions.length; index += 1) {
      const question = validQuestions[index];
      const questionPayload = { exam_id: exam.id, question_number: index + 1, section: question.section, category: question.category.trim() || 'Computer Fundamentals', difficulty: question.difficulty, prompt: question.prompt.trim(), options: question.options.filter((option) => option.trim()), correct_option: question.correct_option.trim(), marks: Math.max(1, Number(question.marks) || 1) };
      const questionResult = question.id
        ? await client.from('exam_questions').update(questionPayload).eq('id', question.id).select('id').single()
        : await client.from('exam_questions').insert(questionPayload).select('id').single();
      if (questionResult.error || !questionResult.data) {
        setNotice(`Exam saved, but question ${index + 1} was not saved: ${questionResult.error?.message ?? 'unknown database error'}`);
        return;
      }
    }
    const { data: savedQuestions, error: reloadError } = await client.from('exam_questions').select('id,question_number,section,category,difficulty,prompt,options,correct_option,marks').eq('exam_id', exam.id).order('question_number');
    if (reloadError) { setNotice(`Exam saved, but questions could not be reloaded: ${reloadError.message}`); return; }
    setQuestions((savedQuestions ?? []).map((item) => ({ ...item, options: Array.isArray(item.options) ? item.options as string[] : [] })));
    setNotice(publish ? 'Exam and questions published.' : 'Exam and questions saved as draft.'); setSelected(exam); await load();
  };

  if (loading) return <p className="text-sm text-slate-500">Loading exams…</p>;
  return <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
    <section className="border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-[#092f52]">Exams</h2><button onClick={() => { setSelected(null); setCode(''); setTitle(''); setDescription(''); setDuration('60'); setPassingMarks('0'); setQuestions([emptyQuestion()]); }} className="bg-[#092f52] px-3 py-2 text-xs font-semibold text-white">New exam</button></div><div className="mt-4 grid gap-2">{exams.map((exam) => <button key={exam.id} onClick={() => void selectExam(exam)} className={`border p-3 text-left ${selected?.id === exam.id ? 'border-[#e8a317] bg-amber-50' : 'border-slate-200'}`}><p className="font-semibold">{exam.title}</p><p className="mt-1 text-xs text-slate-500">{exam.is_published ? 'Published' : 'Draft'} · {exam.total_marks} marks</p></button>)}{exams.length === 0 && <p className="text-sm text-slate-500">No exams created.</p>}</div></section>
    <section className="border border-slate-200 bg-white p-5"><div className="grid gap-4 md:grid-cols-3"><label className="text-sm font-semibold">Exam code<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="CET-2026" className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal uppercase" /></label><label className="text-sm font-semibold">Exam title<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Passing marks<input type="number" min="0" value={passingMarks} onChange={(event) => setPassingMarks(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Duration (minutes)<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label></div><label className="mt-4 block text-sm font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-20 w-full border border-slate-300 px-3 py-2 font-normal" /></label><div className="mt-6 grid gap-2 md:grid-cols-4">{EXAM_SECTIONS.map((section) => { const total = questions.filter((question) => question.section === section.name).reduce((sum, question) => sum + Math.max(1, Number(question.marks) || 1), 0); return <div key={section.name} className="border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold">{section.name}</p><p className="mt-1 text-xs text-slate-500">{questions.filter((question) => question.section === section.name).length}/{section.questionLimit} questions · {total}/{section.markLimit} marks</p></div>; })}</div><div className="mt-6 flex items-center justify-between"><h3 className="font-bold text-[#092f52]">Questions</h3><button onClick={() => setQuestions((items) => [...items, emptyQuestion(items.length + 1)])} className="border border-slate-300 px-3 py-2 text-xs font-semibold">Add question</button></div><div className="mt-3 grid gap-4">{questions.map((question, index) => <div key={question.id ?? index} className="border border-slate-200 p-4"><label className="text-sm font-semibold">Section<select value={question.section} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, section: event.target.value } : item))} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal">{EXAM_SECTIONS.map((section) => <option key={section.name} value={section.name}>{section.name}</option>)}</select></label><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold">Category<input value={question.category} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, category: event.target.value } : item))} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Difficulty<select value={question.difficulty} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, difficulty: event.target.value as Question['difficulty'] } : item))} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal"><option value="very_easy">Very Easy</option><option value="easy">Easy</option><option value="basic_thinking">Basic Thinking</option></select></label></div><label className="mt-3 block text-sm font-semibold">Question {index + 1}<textarea value={question.prompt} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, prompt: event.target.value } : item))} className="mt-1 min-h-16 w-full border border-slate-300 px-3 py-2 font-normal" /></label><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <input key={optionIndex} value={option} placeholder={`Option ${optionIndex + 1}`} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, options: item.options.map((value, currentIndex) => currentIndex === optionIndex ? event.target.value : value) } : item))} className="border border-slate-300 px-3 py-2 text-sm" />)}</div><div className="mt-3 flex flex-wrap gap-2"><select value={question.correct_option} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, correct_option: event.target.value } : item))} className="border border-slate-300 px-3 py-2 text-sm"><option value="">Correct option</option>{question.options.map((option, optionIndex) => <option key={optionIndex} value={option}>{option || `Option ${optionIndex + 1}`}</option>)}</select><input type="number" min="1" value={question.marks} onChange={(event) => setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, marks: Number(event.target.value) } : item))} className="w-24 border border-slate-300 px-3 py-2 text-sm" /></div></div>)}</div><div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={() => void saveExam(false)} className="bg-[#092f52] px-4 py-2 text-sm font-semibold text-white">Save draft</button><button onClick={() => void saveExam(true)} className="bg-[#e8a317] px-4 py-2 text-sm font-semibold text-[#092f52]">Publish exam</button>{notice && <p className="text-sm text-slate-600">{notice}</p>}</div></section>
  </div>;
}
