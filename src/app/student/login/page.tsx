'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, LockKeyhole, UserRound } from 'lucide-react'
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
    setLoading(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setLoading(false)
      setMessage('Invalid roll number, email address, or password.')
      return
    }
    const { data: ticket } = await supabase.from('hall_ticket_details').select('application_id').eq('roll_number', rollNumber.trim()).maybeSingle()
    const { data: application } = await supabase.from('applications').select('id').eq('user_id', data.user.id).maybeSingle()
    if (!ticket || !application || ticket.application_id !== application.id) {
      await supabase.auth.signOut()
      setLoading(false)
      setMessage('Invalid roll number, email address, or password.')
      return
    }
    router.replace('/student/examination/verification')
  }

  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[#eef3f8] px-4 py-8 sm:px-8 sm:py-12">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-sm border border-[#cbd5df] bg-white shadow-[0_18px_50px_rgba(18,59,93,0.12)]">
        <div className="border-b-4 border-[#f4c430] bg-[#123b5d] px-6 py-5 text-white sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white text-[#123b5d] shadow-sm">
              <Building2 className="size-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4c430]">Government of Maharashtra</p>
              <h1 className="mt-1 text-lg font-bold sm:text-2xl">State Common Entrance Test Cell, Maharashtra</h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">Online Computer Based Examination Portal</p>
            </div>
          </div>
        </div>

        <div className="border-b border-[#d7dee6] bg-[#f5f6f7] px-6 py-4 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#637383]">Candidate login</p>
          <h2 className="mt-1 text-xl font-bold text-[#173b5b] sm:text-2xl">Sign in to continue your examination</h2>
        </div>

        <div className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_360px] lg:items-center lg:gap-16">
          <div className="hidden lg:block">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2b7a78]">Secure candidate access</p>
              <h3 className="mt-3 text-4xl font-bold leading-tight text-[#173b5b]">Your examination starts here.</h3>
              <p className="mt-4 leading-7 text-[#637383]">Use the roll number, registered email address, and password associated with your application.</p>
              <div className="mt-7 flex items-start gap-3 border-l-4 border-[#f4c430] bg-[#fff9df] px-4 py-3 text-sm leading-6 text-[#5d552b]">
                <LockKeyhole className="mt-1 size-4 shrink-0" aria-hidden="true" />
                <span>Never share your examination credentials with anyone.</span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="border border-[#d7dee6] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#e5e9ee] pb-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#e8f1f7] text-[#123b5d]"><UserRound className="size-5" aria-hidden="true" /></div>
              <div><p className="font-bold text-[#173b5b]">Login</p><p className="text-xs text-[#718092]">Enter your candidate details</p></div>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-[#405466]">Roll Number<input value={rollNumber} onChange={e => setRollNumber(e.target.value)} required autoComplete="username" className="mt-2 w-full rounded-sm border border-[#bac7d2] px-4 py-3 text-[#173b5b] outline-none transition focus:border-[#2b7a78] focus:ring-2 focus:ring-[#2b7a78]/15" /></label>
              <label className="text-sm font-semibold text-[#405466]">Registered Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="mt-2 w-full rounded-sm border border-[#bac7d2] px-4 py-3 text-[#173b5b] outline-none transition focus:border-[#2b7a78] focus:ring-2 focus:ring-[#2b7a78]/15" /></label>
              <label className="text-sm font-semibold text-[#405466]">Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="mt-2 w-full rounded-sm border border-[#bac7d2] px-4 py-3 text-[#173b5b] outline-none transition focus:border-[#2b7a78] focus:ring-2 focus:ring-[#2b7a78]/15" /></label>
              {message && <p role="alert" className="text-sm font-medium text-red-700">{message}</p>}
              <button disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-[#2b7a78] px-4 py-3.5 font-bold text-white transition hover:bg-[#216462] disabled:opacity-60">{loading ? 'Verifying…' : 'Sign In'}<LockKeyhole className="size-4" aria-hidden="true" /></button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
