'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Keyboard, LockKeyhole, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CandidateLoginPage() {
  const router = useRouter()
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setLoading(false)
      setMessage('Invalid roll number, email address, or password.')
      return
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session?.user) {
      setLoading(false)
      setMessage('Your session could not be established. Please try again.')
      return
    }

    const { data: applications, error: applicationError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', sessionData.session.user.id)

    if (applicationError || !applications?.length) {
      await supabase.auth.signOut()
      setLoading(false)
      setMessage('Roll Number does not match this candidate.')
      return
    }

    const applicationIds = applications.map(application => application.id)
    const { data: tickets, error: ticketError } = await supabase
      .from('hall_ticket_details')
      .select('application_id, roll_number, status')
      .in('application_id', applicationIds)

    const normalizedRollNumber = rollNumber.trim().toLowerCase()
    const ticket = tickets?.find(candidateTicket =>
      candidateTicket.status === 'published' &&
      typeof candidateTicket.roll_number === 'string' &&
      candidateTicket.roll_number.trim().toLowerCase() === normalizedRollNumber,
    )

    if (ticketError || !ticket) {
      await supabase.auth.signOut()
      setLoading(false)
      setMessage('Roll Number does not match this candidate.')
      return
    }

    router.replace('/student/examination/verification')
  }

  return (
    <main className="min-h-screen bg-[#111] font-sans text-[#555] sm:flex sm:items-center sm:justify-center sm:p-2">
      <div className="min-h-screen w-full max-w-[1024px] overflow-hidden bg-white shadow-2xl sm:min-h-[576px]">
      <div className="h-8 bg-[#3f76b8]" />
      <section className="border-b-2 border-[#777] bg-[#686868] text-white shadow-sm">
        <div className="flex min-h-[154px] items-stretch justify-between">
          <div className="flex flex-1 flex-col justify-center px-5 py-5 sm:px-8">
            <p className="text-base font-medium sm:text-lg">System Name :</p>
            <p className="mt-1 text-3xl font-semibold leading-none text-[#fff500] sm:text-4xl">Candidate Portal</p>
            <p className="mt-3 max-w-[430px] text-sm leading-5 sm:text-base">Contact invigilator if the Name and Photograph displayed on the screen is not yours</p>
          </div>
          <div className="flex w-[180px] shrink-0 flex-col items-end justify-center border-l border-white/20 px-4 py-4 text-right sm:w-[305px] sm:px-7">
            <p className="text-base sm:text-lg">Candidate Name :</p>
            <p className="mt-1 text-2xl leading-none text-[#fff500] sm:text-3xl">Candidate Login</p>
            <p className="mt-4 text-base sm:text-lg">Subject : <span className="text-[#fff500]">Secure Examination</span></p>
          </div>
          <div className="hidden w-[145px] items-center justify-center border-l-2 border-[#777] bg-white sm:flex">
            <div className="flex size-[104px] items-center justify-center border border-[#555] bg-[#f4f4f4] text-[#555]">
              <UserRound className="size-20 stroke-[1.3]" aria-label="Candidate photo placeholder" />
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-190px)] items-start justify-center px-4 py-8 sm:py-8">
        <form onSubmit={submit} className="w-full max-w-[294px] border border-[#ddd] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.12)]">
          <div className="border-b border-[#c9c9c9] bg-gradient-to-b from-[#eeeeee] to-[#d8d8d8] px-5 py-2.5 text-base font-semibold text-[#444]">Login</div>
          <div className="flex flex-col gap-4 px-7 py-6 sm:px-7 sm:py-7">
            <div className="flex h-10 border border-[#d5d5d5] bg-[#f4f4f4]">
              <span className="flex w-12 items-center justify-center border-r border-[#d5d5d5] text-[#666]"><UserRound className="size-6" aria-hidden="true" /></span>
              <input aria-label="Roll Number" value={rollNumber} onChange={e => setRollNumber(e.target.value)} required autoComplete="username" placeholder="Roll Number" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#444] outline-none placeholder:text-[#aaa]" />
              <span className="flex w-12 items-center justify-center border-l border-[#d5d5d5] text-[#666]"><Keyboard className="size-5" aria-hidden="true" /></span>
            </div>
            <div className="flex h-10 border border-[#d5d5d5] bg-[#f4f4f4]">
              <span className="flex w-12 items-center justify-center border-r border-[#d5d5d5] text-[#666]"><LockKeyhole className="size-6" aria-hidden="true" /></span>
              <input type="password" aria-label="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Password" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#444] outline-none placeholder:text-[#aaa]" />
              <span className="flex w-12 items-center justify-center border-l border-[#d5d5d5] text-[#666]"><Keyboard className="size-5" aria-hidden="true" /></span>
            </div>
            <label className="text-xs text-[#777]">Registered email<input type="email" aria-label="Registered Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="mt-1 w-full border border-[#d5d5d5] bg-[#f4f4f4] px-3 py-2 text-sm text-[#444] outline-none focus:border-[#4ca6df]" /></label>
            {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
            <button type="submit" disabled={loading} className="mt-1 h-11 bg-[#4ba6df] text-base text-white transition hover:bg-[#3798d4] disabled:opacity-60">{loading ? 'Signing in…' : 'Sign In'}</button>
          </div>
        </form>
      </section>
      </div>
    </main>
  )
}
