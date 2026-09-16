'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getExamData, type Exam, type Question } from '@/lib/exam'

type Answer = { selected_option: string | null; marked_for_review: boolean }

export default function AttemptPage() {
  const { examId } = useParams<{ examId: string }>()
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [current, setCurrent] = useState(0)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const question = questions[current]
  const answer = question ? answers[question.id] : undefined
  const answered = useMemo(() => Object.values(answers).filter((item) => item.selected_option).length, [answers])

  useEffect(() => {
    void (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/student/login')
      try {
        const result = await getExamData(examId)
        if (!result.exam || !result.questions.length) throw new Error('This examination is not currently available.')
        const { data: applications } = await supabase.from('applications').select('id').eq('user_id', user.id)
        const ids = (applications || []).map((item) => item.id)
        const { data: tickets } = await supabase.from('hall_ticket_details').select('application_id,status').in('application_id', ids)
        const applicationId = tickets?.find((ticket) => ticket.status === 'published')?.application_id
        if (!applicationId) throw new Error('No published hall ticket is linked to this candidate.')
        const { data: started, error: startError } = await supabase.rpc('start_exam_attempt', { p_exam_id: examId, p_application_id: applicationId })
        const attempt = started?.[0]
        if (startError || !attempt?.attempt_id) throw new Error(startError?.message || 'The secure examination session could not be started.')
        setExam(result.exam)
        setQuestions(result.questions)
        setAttemptId(attempt.attempt_id)
        setSeconds(Math.max(0, Math.floor((new Date(attempt.expires_at).getTime() - Date.now()) / 1000)))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to start examination.')
      } finally {
        setLoading(false)
      }
    })()
  }, [examId, router])

  const submit = useCallback(async () => {
    if (!attemptId || submitting) return
    setSubmitting(true)
    const { data } = await createClient().rpc('submit_exam_attempt', { p_attempt_id: attemptId })
    const result = data?.[0]
    router.replace(result ? `/exam/result/${attemptId}?score=${result.score}&total=${result.total_marks}&status=${result.status}` : `/exam/result/${attemptId}`)
  }, [attemptId, router, submitting])

  useEffect(() => {
    if (!attemptId || submitting || seconds <= 0) return
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [attemptId, submitting, seconds])

  async function saveAnswer(questionId: string, patch: Partial<Answer>) {
    if (!attemptId) return
    const next = { selected_option: answers[questionId]?.selected_option || null, marked_for_review: answers[questionId]?.marked_for_review || false, ...patch }
    setAnswers((items) => ({ ...items, [questionId]: next }))
    await createClient().from('exam_answers').upsert({ attempt_id: attemptId, question_id: questionId, ...next }, { onConflict: 'attempt_id,question_id' })
  }

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const stateClass = (index: number) => index === current ? 'bg-[#173f63] text-white border-[#173f63]' : answers[questions[index]?.id]?.marked_for_review ? 'bg-[#c58a17] text-white border-[#c58a17]' : answers[questions[index]?.id]?.selected_option ? 'bg-[#087f78] text-white border-[#087f78]' : index < current ? 'bg-[#e8edf1] text-[#526477] border-[#c5ced7]' : 'bg-white text-[#526477] border-[#c5ced7]'

  if (loading) return <main className="min-h-screen bg-[#edf3f7] p-8 text-sm text-[#526477]">Preparing your secure examination session...</main>
  if (error) return <main className="min-h-screen bg-[#edf3f7] p-8"><section className="mx-auto max-w-2xl rounded-xl border border-[#e7c65a] bg-[#fff9e8] p-6 text-[#5d310f]"><h1 className="text-lg font-bold">Unable to start examination</h1><p className="mt-2 text-sm">{error}</p><button onClick={() => router.push('/student/examination/instructions')} className="mt-5 rounded-lg bg-[#087f78] px-4 py-2 text-sm font-bold text-white">Back to instructions</button></section></main>
  if (!exam || !question) return null

  return <main className="min-h-screen bg-[#edf3f7] text-[#24364b]"><header className="flex h-16 items-center justify-between bg-[#173f63] px-5 text-white shadow-sm"><div><p className="text-sm font-bold">{exam.title || 'General Knowledge Examination'}</p><p className="text-xs text-blue-100">Online Computer Based Examination</p></div><div className="flex items-center gap-3 text-xs"><span className="rounded border border-white/30 px-3 py-2">General Knowledge</span><span className="rounded bg-white/10 px-3 py-2 tabular-nums">Time Left {minutes}:{secs}</span></div></header><div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row"><section className="min-w-0 flex-1 bg-white"><div className="flex items-center justify-between border-b border-[#d9e0e7] bg-[#f8fafb] px-5 py-3"><span className="rounded bg-[#087f78] px-4 py-2 text-sm font-bold text-white">General Knowledge</span><span className="text-xs text-[#526477]">{answered}/{questions.length} Answered</span></div><div className="border-b border-[#d9e0e7] px-6 py-5"><p className="text-xs font-bold uppercase tracking-wide text-[#526477]">Question {current + 1} of {questions.length} <span className="ml-2 font-normal text-[#8793a1]">| {question.marks} mark{question.marks === 1 ? '' : 's'}</span></p><h1 className="mt-4 max-w-4xl text-xl font-semibold leading-8 text-[#172b43]">{question.prompt}</h1></div><div className="space-y-3 px-6 py-5"><p className="mb-2 text-xs text-[#6c7a89]">Choose one answer from the options below</p>{question.options.map((option, index) => <button key={option} onClick={() => void saveAnswer(question.id, { selected_option: option })} className={`flex w-full items-center gap-4 rounded border px-4 py-3 text-left text-sm transition ${answer?.selected_option === option ? 'border-[#087f78] bg-[#e8f5f2]' : 'border-[#dbe2e9] bg-white hover:border-[#087f78]'}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f3f5] text-xs font-bold text-[#526477]">{index + 1}</span>{option}</button>)}</div><div className="flex flex-wrap gap-3 border-t border-[#d9e0e7] px-6 py-4"><button onClick={() => void saveAnswer(question.id, { selected_option: null })} className="rounded border border-[#c78585] bg-white px-4 py-2 text-xs font-semibold text-[#a34545]">Clear Answer</button><button onClick={() => void saveAnswer(question.id, { marked_for_review: !answer?.marked_for_review })} className="rounded border border-[#c9a04a] bg-white px-4 py-2 text-xs font-semibold text-[#8a6818]">{answer?.marked_for_review ? 'Remove Review' : 'Mark for Review'}</button><span className="flex-1" /><button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} className="rounded border border-[#bac7d2] bg-white px-4 py-2 text-xs font-semibold text-[#526477] disabled:opacity-40">Previous</button><button disabled={current === questions.length - 1} onClick={() => setCurrent((value) => value + 1)} className="rounded bg-[#173f63] px-5 py-2 text-xs font-semibold text-white disabled:opacity-40">Save &amp; Next</button><button onClick={() => void submit()} className="rounded bg-[#d9534f] px-5 py-2 text-xs font-semibold text-white">Finish Test</button></div></section><aside className="w-full border-l border-[#d9e0e7] bg-[#f8fafb] lg:w-72"><div className="border-b border-[#d9e0e7] px-4 py-4"><p className="text-xs font-bold uppercase tracking-wide text-[#526477]">Question Palette</p><div className="mt-3 grid grid-cols-6 gap-2">{questions.map((item, index) => <button key={item.id} onClick={() => setCurrent(index)} className={`h-8 rounded border text-xs font-bold ${stateClass(index)}`} aria-label={`Go to question ${index + 1}`}>{index + 1}</button>)}</div></div><div className="border-b border-[#d9e0e7] px-4 py-4"><p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#526477]">Status</p><div className="space-y-2 text-xs text-[#526477]"><p><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#087f78]" />Answered</p><p><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#c58a17]" />Marked for Review</p><p><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-[#e8edf1]" />Visited</p><p><span className="mr-2 inline-block h-3 w-3 rounded-sm border border-[#c5ced7] bg-white" />Not Visited</p></div></div><div className="px-4 py-4"><p className="text-xs font-bold uppercase tracking-wide text-[#526477]">Exam Summary</p><table className="mt-3 w-full text-left text-xs"><thead><tr className="border-b border-[#d9e0e7] text-[#8793a1]"><th className="py-2 font-medium">Section</th><th className="py-2 text-right font-medium">Questions</th><th className="py-2 text-right font-medium">Marks</th></tr></thead><tbody><tr><td className="py-2">Computer MCQ</td><td className="py-2 text-right">125</td><td className="py-2 text-right">125</td></tr><tr><td className="py-2">General Knowledge</td><td className="py-2 text-right">125</td><td className="py-2 text-right">125</td></tr><tr><td className="py-2">Image Identification</td><td className="py-2 text-right">25</td><td className="py-2 text-right">25</td></tr><tr><td className="py-2">Computer Full Forms</td><td className="py-2 text-right">25</td><td className="py-2 text-right">25</td></tr><tr className="font-bold text-[#173f63]"><td className="py-2">Total</td><td className="py-2 text-right">300</td><td className="py-2 text-right">300</td></tr></tbody></table></div></aside></div></main>
}
