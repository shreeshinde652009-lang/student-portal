'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ExamLoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); const { error } = await createClient().auth.signInWithPassword({ email, password }); setLoading(false); if (error) { setError('Invalid email or password.'); return } router.push('/exam/dashboard') }
  return <main className="min-h-[70vh] flex items-center justify-center"><form onSubmit={submit} className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">CET examination portal</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Student sign in</h1><p className="mt-1 text-sm text-slate-500">Use your registered examination credentials.</p></div><label className="block text-sm font-medium text-slate-700">Email<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block text-sm font-medium text-slate-700">Password<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-lg bg-blue-800 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in securely'}</button></form></main>
}
