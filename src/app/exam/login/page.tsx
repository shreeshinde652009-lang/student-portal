'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ExamLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const result = mode === 'register'
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (result.error) {
      setMessage(mode === 'register' ? 'Registration could not be completed. Check your details and try again.' : 'Invalid email or password.')
      return
    }

    setMessage(mode === 'register' ? 'Registration successful. Check your email to confirm your account, then sign in.' : 'Login successful. Your examination access is ready.')
    if (mode === 'login') window.location.reload()
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">CET examination portal</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{mode === 'login' ? 'Candidate login' : 'Candidate registration'}</h1>
          <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to access your examination.' : 'Create your examination candidate account.'}</p>
        </div>
        <div className="flex flex-col gap-4">
          {mode === 'register' && <label className="text-sm font-medium text-slate-700">Full name<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" required value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>}
          <label className="text-sm font-medium text-slate-700">Email<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="text-sm font-medium text-slate-700">Password<input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-blue-800 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in securely' : 'Register candidate'}</button>
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }} className="text-sm font-semibold text-blue-800 hover:underline">{mode === 'login' ? 'New candidate? Register here' : 'Already registered? Sign in'}</button>
        </div>
      </form>
    </main>
  )
}
