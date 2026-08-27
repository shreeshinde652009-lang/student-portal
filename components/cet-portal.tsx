'use client'

import { FormEvent, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }
    window.location.assign('/dashboard')
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-primary/50 p-4" role="dialog" aria-modal="true" aria-labelledby="student-sign-in-title"><div className="w-full max-w-3xl rounded-xl border border-border bg-card p-7 shadow-2xl"><div className="mb-6 flex justify-between"><div><p className="font-semibold text-primary">Academic Year 2026-27</p><h2 id="student-sign-in-title" className="mt-1 text-2xl font-bold">Student Sign In</h2></div><button onClick={onClose} aria-label="Close"><X /></button></div><div className="grid gap-6 md:grid-cols-2"><form className="flex flex-col gap-4" onSubmit={handleSubmit}><label className="flex flex-col gap-2 text-sm font-medium">Registered Email ID<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="rounded-md border border-input bg-background px-3 py-3" /></label><label className="flex flex-col gap-2 text-sm font-medium">Password<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="rounded-md border border-input bg-background px-3 py-3" /></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<button disabled={loading} className="rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">{loading ? 'Signing In...' : 'Sign In'}</button></form><div className="flex flex-col justify-center border-t border-border pt-5 text-center md:border-l md:border-t-0 md:pl-6"><h3 className="text-xl font-bold">New user?</h3><a href="/register" className="mt-5 rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground">Register</a></div></div><p className="mt-6 border-t border-border pt-5 text-center text-sm text-primary">Forgot Password · User Manual · Tutorial Video</p><a href="/dashboard/linux-cs-registration" className="mt-4 block rounded-md border border-primary px-4 py-3 text-center font-bold text-primary">Already signed in? Open Linux CS Registration</a></div></div>
}

export function CetPortal() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background text-foreground">

      <section id="home" className="mx-auto max-w-[1350px] overflow-hidden bg-primary"><div className="relative aspect-[1350/625] min-h-[300px] w-full overflow-hidden"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cet%20first%20pa-ZOMkkrB168YoRYCYqL6MwUbOGrT3yv.png" alt="State CET Cell examination and admission services" className="absolute inset-0 size-full object-cover object-center" /><div className="absolute inset-y-0 right-0 flex w-[30%] flex-col"><button onClick={() => setLoginOpen(true)} aria-label="Open CET Examination portal" className="h-1/4 cursor-pointer bg-transparent" /><button onClick={() => setLoginOpen(true)} aria-label="Open Admission portal" className="h-1/4 cursor-pointer bg-transparent" /><button onClick={() => setLoginOpen(true)} aria-label="Open Foreign Candidate Registration" className="h-1/4 cursor-pointer bg-transparent" /><button onClick={() => setLoginOpen(true)} aria-label="Open Student Help Centre" className="h-1/4 cursor-pointer bg-transparent" /></div></div></section>

      <section id="notices" className="border-y border-border bg-secondary/50"><div className="mx-auto max-w-[1350px] px-6 py-10 lg:px-10"><h2 className="text-2xl font-bold text-primary">Latest Notices</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{['CET Cell Portal 2026 is now open','Keep your documents ready','Review details before final submission'].map((item, i) => <article key={item} className="rounded-lg border border-border bg-card p-5"><p className="text-xs font-bold text-accent">NOTICE 0{i + 1}</p><h3 className="mt-2 font-semibold text-primary">{item}</h3><p className="mt-2 text-sm text-muted-foreground">Official candidate update for Academic Year 2026-27.</p></article>)}</div></div></section>
      <footer id="help" className="bg-card px-6 py-10 text-center"><p className="font-semibold text-primary">Office Address</p><p className="mt-2">8th Floor, New Excelsior Building, A. K. Nayak Marg, Fort, Mumbai 400001</p><p className="mt-6 text-sm text-muted-foreground">Copyright © State CET Cell, Maharashtra State, Mumbai. All rights reserved.</p></footer>
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} />}
    </main>
  )
}
