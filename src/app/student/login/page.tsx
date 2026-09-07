'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CandidateLoginPage() {
  const router = useRouter()
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) { setLoading(false); setMessage('Invalid roll number, email address, or password.'); return }
    const { data: ticket } = await supabase.from('hall_ticket_details').select('application_id,roll_number').eq('roll_number', rollNumber.trim()).maybeSingle()
    const { data: application } = await supabase.from('applications').select('id').eq('user_id', data.user.id).maybeSingle()
    if (!ticket || !application || ticket.application_id !== application.id) { await supabase.auth.signOut(); setLoading(false); setMessage('Invalid roll number, email address, or password.'); return }
    router.replace('/student/examination/verification')
  }

  return <main className="min-h-[calc(100vh-8rem)] bg-[#f4f7fb] px-6 py-12"><section className="mx-auto max-w-md rounded-3xl border border-[#d8e4ed] bg-white p-8 shadow-xl shadow-[#123b5d]/5"><div className="flex size-14 items-center justify-center rounded-2xl bg-[#123b5d] text-white"><ClipboardCheck className="size-7" aria-hidden="true" /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#287a78]">Candidate access</p><h1 className="mt-2 text-3xl font-bold text-[#123b5d]">Login to Examination Portal</h1><p className="mt-3 text-sm leading-6 text-slate-500">Enter the details exactly as printed on your hall ticket.</p><form onSubmit={submit} className="mt-8 flex flex-col gap-5"><label className="text-sm font-semibold text-slate-700">Roll Number<input value={rollNumber} onChange={e => setRollNumber(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#287a78] focus:ring-2 focus:ring-[#287a78]/15" /></label><label className="text-sm font-semibold text-slate-700">Registered Email Address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#287a78] focus:ring-2 focus:ring-[#287a78]/15" /></label><label className="text-sm font-semibold text-slate-700">Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#287a78] focus:ring-2 focus:ring-[#287a78]/15" /></label>{message && <p role="alert" className="text-sm font-medium text-red-700">{message}</p>}<button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#287a78] px-4 py-3.5 font-bold text-white hover:bg-[#216462] disabled:opacity-60"><LockKeyhole className="size-4" aria-hidden="true" />{loading ? 'Verifying…' : 'Login to Examination Portal'}</button></form></section></main>
}
