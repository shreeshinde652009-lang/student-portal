'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Candidate = Record<string, string | null>

export default function VerificationPage() {
  const router = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function loadCandidate() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        if (mounted) router.replace('/student/login')
        return
      }

      const { data: app } = await supabase
        .from('applications')
        .select('id,application_number,personal_data')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!app) {
        if (mounted) router.replace('/student/login')
        return
      }

      const { data: ticket } = await supabase
        .from('hall_ticket_details')
        .select('candidate_name,application_number,roll_number,exam_name,exam_date,exam_time,exam_center_name,photo_path')
        .eq('application_id', app.id)
        .maybeSingle()
      const personal = (app.personal_data || {}) as Record<string, string>

      if (mounted) {
        setCandidate({
          name: ticket?.candidate_name || personal.full_name || null,
          application: ticket?.application_number || app.application_number,
          roll: ticket?.roll_number || null,
          exam: ticket?.exam_name || 'Common Entrance Examination',
          date: ticket?.exam_date || null,
          session: ticket?.exam_time || null,
          center: ticket?.exam_center_name || null,
          photo: ticket?.photo_path || null,
        })
        setLoading(false)
      }
    }

    void loadCandidate()
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        if (mounted) router.replace('/student/login')
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [router])

  if (loading) return <main className="p-10 text-center text-[#637383]">Checking secure session…</main>
  if (!candidate) return null
  const initials = (candidate.name || 'Candidate').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()

  return <main className="min-h-[calc(100vh-9rem)] bg-[#eef3f8] px-4 py-8 sm:px-8">
    <section className="mx-auto max-w-6xl overflow-hidden border border-[#cbd5df] bg-white shadow-[0_18px_50px_rgba(18,59,93,0.12)]">
      <div className="border-b border-[#b8c3ce] bg-[#626466] px-5 py-4 text-white sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div><p className="text-xs text-white/75">Examination System</p><h1 className="mt-1 text-2xl font-bold text-[#f4c430]">{candidate.exam}</h1><p className="mt-2 text-sm text-white/85">Verify your candidate details before proceeding to the examination.</p></div>
          <div className="flex items-center gap-4"><div className="text-right"><p className="text-xs text-white/75">Candidate Name</p><p className="text-xl font-bold text-[#f4c430]">{candidate.name || 'Candidate'}</p><p className="text-xs text-white/75">Roll Number: {candidate.roll || '—'}</p></div><div className="flex size-20 items-center justify-center overflow-hidden border-2 border-white bg-[#e8edf2] text-2xl font-bold text-[#123b5d]">{candidate.photo ? <img src={candidate.photo} alt="Candidate" className="size-full object-cover" /> : initials}</div></div>
        </div>
      </div>
      <div className="p-5 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2b7a78]">Secure identity check</p><h2 className="mt-2 text-3xl font-bold text-[#173b5b]">Candidate Verification</h2><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries({ 'Application Number': candidate.application, 'Roll Number': candidate.roll, Examination: candidate.exam, 'Exam Center': candidate.center, 'Exam Date': candidate.date, Session: candidate.session }).map(([label, value]) => <div key={label} className="border border-[#d8e1e9] bg-[#f6f8fa] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#718092]">{label}</p><p className="mt-2 font-semibold text-[#173b5b]">{value || 'Not available'}</p></div>)}</div><button onClick={() => router.push('/student/examination/instructions')} className="mt-8 rounded-sm bg-[#2b7a78] px-6 py-3 font-bold text-white hover:bg-[#216462]">Continue to Instructions</button></div>
    </section>
  </main>
}
