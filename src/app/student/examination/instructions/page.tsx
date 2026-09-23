'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getExamDayData, getPublishedExamData, type Exam, type ExamDay } from '@/lib/exam'
import { StudentAiAssistant } from '@/components/StudentAiAssistant'

export default function InstructionsPage() {
  const router = useRouter()
  const [dayId, setDayId] = useState<string | null>(null)
  const [exam, setExam] = useState<Exam | null>(null)
  const [day, setDay] = useState<ExamDay | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { const selectedDayId = new URLSearchParams(window.location.search).get('dayId'); setDayId(selectedDayId); (async () => { try { const { exam: value } = await getPublishedExamData(); setExam(value); if (selectedDayId) { const { day: selectedDay } = await getExamDayData(selectedDayId); setDay(selectedDay) } } catch { setExam(null) } finally { setLoading(false) } })() }, [])
  if (loading) return <main className="mx-auto max-w-4xl px-6 py-12 text-sm text-slate-500">Loading instructions...</main>
  if (!exam) return <main className="mx-auto max-w-4xl px-6 py-12"><div className="rounded-2xl border border-[#d8e4ed] bg-white p-8 text-[#123b5d]">Examination is currently unavailable.</div></main>
  const rows = [['Computer MCQ', '125', '125'], ['General Knowledge', '125', '125'], ['Image Identification', '25', '25'], ['Computer Full Forms', '25', '25']]
  return <><main className="min-h-screen bg-[#edf3f7] px-4 py-8 text-[#24364b] sm:px-8"><section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#d8e4ed] bg-white shadow-xl shadow-[#123b5d]/5"><header className="bg-[#173f63] px-6 py-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Online Computer Based Examination</p><h1 className="mt-2 text-2xl font-bold">{day ? `Day ${day.day_number}: ${day.title}` : 'General Knowledge Examination'}</h1><p className="mt-1 text-sm text-blue-100">{day ? `${day.duration_minutes} minutes · 50 questions · 50 marks` : `${exam.duration_minutes} minutes · 300 questions · 300 marks`}</p></header><div className="p-6 sm:p-8"><h2 className="text-xl font-bold text-[#173f63]">General Instructions</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-[#526477]"><li>Keep a stable internet connection throughout the examination.</li><li>The timer continues after refresh and the attempt auto-submits when time expires.</li><li>Use the question palette to navigate and mark questions for review.</li><li>Once submitted, answers cannot be changed.</li></ul><div className="mt-8 overflow-x-auto rounded-xl border border-[#d9e0e7]"><table className="w-full text-left text-sm"><thead className="bg-[#f2f6f8] text-xs uppercase tracking-wide text-[#526477]"><tr><th className="px-4 py-3">Section</th><th className="px-4 py-3 text-right">Questions</th><th className="px-4 py-3 text-right">Marks</th></tr></thead><tbody>{rows.map(([name, questions, marks]) => <tr key={name} className="border-t border-[#edf0f2]"><td className="px-4 py-3">{name}</td><td className="px-4 py-3 text-right">{questions}</td><td className="px-4 py-3 text-right">{marks}</td></tr>)}<tr className="border-t-2 border-[#173f63] font-bold text-[#173f63]"><td className="px-4 py-3">Total</td><td className="px-4 py-3 text-right">300</td><td className="px-4 py-3 text-right">300</td></tr></tbody></table></div><div className="mt-8 flex flex-wrap gap-3"><Link href="/student/examination/verification" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">Back</Link><button onClick={() => router.push(`/exam/${exam.id}/attempt${dayId ? `?dayId=${dayId}` : ''}`)} className="rounded-xl bg-[#087f78] px-5 py-3 text-sm font-bold text-white hover:bg-[#076d67]">Start {day ? `Day ${day.day_number}` : 'Examination'}</button></div></div></section></main><StudentAiAssistant /></>
}
