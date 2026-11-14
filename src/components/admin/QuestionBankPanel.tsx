'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Difficulty = 'very_easy' | 'easy' | 'basic_thinking';
type Question = { id: string; exam_id: string; question_number: number; section: string; category: string; difficulty: Difficulty; prompt: string; options: string[]; correct_option: string | null; marks: number };

const difficultyLabels: Record<Difficulty, string> = { very_easy: 'Very Easy', easy: 'Easy', basic_thinking: 'Basic Thinking' };

export function QuestionBankPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await createClient().from('exam_questions').select('id,exam_id,question_number,section,category,difficulty,prompt,options,correct_option,marks').order('section').order('question_number').limit(500);
    if (error) setNotice(`Unable to load question bank: ${error.message}`);
    setQuestions((data ?? []) as Question[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const categories = useMemo(() => Array.from(new Set(questions.map((question) => question.category))).sort(), [questions]);
  const filtered = useMemo(() => questions.filter((question) => (difficulty === 'all' || question.difficulty === difficulty) && (category === 'all' || question.category === category) && `${question.prompt} ${question.section} ${question.category}`.toLowerCase().includes(query.toLowerCase())), [questions, query, difficulty, category]);
  const invalidAnswerCount = questions.filter((question) => !question.correct_option || !['A', 'B', 'C', 'D'].includes(question.correct_option) || question.options?.length !== 4).length;
  const counts = useMemo(() => questions.reduce<Record<string, number>>((result, question) => { result[question.difficulty] = (result[question.difficulty] ?? 0) + 1; return result; }, {}), [questions]);

  return <section className="border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-400">CET question repository</p><h2 className="text-2xl font-bold text-[#092f52]">Question Bank</h2><p className="mt-1 text-sm text-slate-500">{questions.length} saved questions · {counts.very_easy ?? 0} very easy · {counts.easy ?? 0} easy · {counts.basic_thinking ?? 0} basic thinking</p><p className={`mt-2 text-xs font-semibold ${invalidAnswerCount ? 'text-red-600' : 'text-emerald-700'}`}>{invalidAnswerCount ? `${invalidAnswerCount} questions need a valid answer key` : 'All saved questions have valid answer keys'}</p></div><button onClick={() => void load()} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-semibold"><RefreshCw size={15} />Refresh</button></div>
    {notice && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{notice}</p>}
    <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_220px]"><label className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompt or section" className="w-full border border-slate-300 py-2 pl-9 pr-3 text-sm" /></label><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="border border-slate-300 px-3 py-2 text-sm"><option value="all">All difficulty</option>{Object.entries(difficultyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={category} onChange={(event) => setCategory(event.target.value)} className="border border-slate-300 px-3 py-2 text-sm"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    {loading ? <p className="mt-6 text-sm text-slate-500">Loading question bank…</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-400"><th className="px-3 py-3">No.</th><th className="px-3 py-3">Section</th><th className="px-3 py-3">Question</th><th className="px-3 py-3">Options</th><th className="px-3 py-3">Saved answer</th><th className="px-3 py-3">Difficulty</th><th className="px-3 py-3">Marks</th></tr></thead><tbody>{filtered.map((question) => <tr key={question.id} className="border-b border-slate-100 align-top"><td className="px-3 py-3 font-semibold">{question.question_number}</td><td className="px-3 py-3"><span className="font-medium">{question.section}</span><span className="mt-1 block text-xs text-slate-500">{question.category}</span></td><td className="max-w-[360px] px-3 py-3">{question.prompt}</td><td className="px-3 py-3 text-xs text-slate-600">{(question.options ?? []).map((option, index) => <div key={`${question.id}-${index}`}>{String.fromCharCode(65 + index)}. {option}</div>)}</td><td className="px-3 py-3"><span className={question.correct_option && ['A', 'B', 'C', 'D'].includes(question.correct_option) ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>{question.correct_option ?? 'Missing'}</span></td><td className="px-3 py-3">{difficultyLabels[question.difficulty]}</td><td className="px-3 py-3">{question.marks}</td></tr>)}</tbody></table>{filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No questions match these filters.</p>}</div>}
  </section>;
}
