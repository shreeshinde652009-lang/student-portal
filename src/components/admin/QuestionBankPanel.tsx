'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Question = { id: string; exam_id: string; question_number: number; section: string; category: string; difficulty: 'very_easy' | 'easy' | 'basic_thinking'; prompt: string; options: string[]; marks: number };

const difficultyLabels = { very_easy: 'Very Easy', easy: 'Easy', basic_thinking: 'Basic Thinking' };

export function QuestionBankPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await createClient().from('exam_questions').select('id,exam_id,question_number,section,category,difficulty,prompt,options,marks').order('section').order('question_number').limit(500);
    if (error) setNotice(`Unable to load question bank: ${error.message}`);
    setQuestions((data ?? []) as Question[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const categories = useMemo(() => Array.from(new Set(questions.map((question) => question.category))).sort(), [questions]);
  const filtered = useMemo(() => questions.filter((question) => (difficulty === 'all' || question.difficulty === difficulty) && (category === 'all' || question.category === category) && `${question.prompt} ${question.section} ${question.category}`.toLowerCase().includes(query.toLowerCase())), [questions, query, difficulty, category]);
  const counts = useMemo(() => questions.reduce<Record<string, number>>((result, question) => { result[question.difficulty] = (result[question.difficulty] ?? 0) + 1; return result; }, {}), [questions]);

  return <section className="border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-400">CET question repository</p><h2 className="text-2xl font-bold text-[#092f52]">Question Bank</h2><p className="mt-1 text-sm text-slate-500">{questions.length} saved questions · {counts.very_easy ?? 0} very easy · {counts.easy ?? 0} easy · {counts.basic_thinking ?? 0} basic thinking</p></div><button onClick={() => void load()} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-semibold"><RefreshCw size={15} />Refresh</button></div>{notice && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{notice}</p>}<div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_220px]"><label className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompt or section" className="w-full border border-slate-300 py-2 pl-9 pr-3 text-sm" /></label><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="border border-slate-300 px-3 py-2 text-sm"><option value="all">All difficulty</option>{Object.entries(difficultyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={category} onChange={(event) => setCategory(event.target.value)} className="border border-slate-300 px-3 py-2 text-sm"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>{loading ? <p className="mt-6 text-sm text-slate-500">Loading question bank…</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-400"><th className="px-3 py-3">Section</th><th className="px-3 py-3">Question</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Difficulty</th><th className="px-3 py-3">Options</th><th className="px-3 py-3">Marks</th></tr></thead><tbody>{filtered.map((question) => <tr key={question.id} className="border-b border-slate-100 align-top"><td className="px-3 py-4"><p className="font-semibold">{question.section}</p><p className="text-xs text-slate-500">Q{question.question_number}</p></td><td className="max-w-md px-3 py-4 font-medium">{question.prompt}</td><td className="px-3 py-4 text-xs">{question.category}</td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{difficultyLabels[question.difficulty]}</span></td><td className="px-3 py-4 text-xs text-slate-500">{question.options?.length ?? 0}</td><td className="px-3 py-4 font-semibold">{question.marks}</td></tr>)}</tbody></table>{!filtered.length && <p className="border-t border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">No matching questions.</p>}</div>}</section>;
}
