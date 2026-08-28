'use client'

import { FormEvent, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    })
    if (error) {
      const errorText = error.message.toLowerCase()
      if (errorText.includes('student_capacity_reached') || errorText.includes('capacity')) {
        setMessage('Registration is closed: 20 student seats are already filled. नोंदणी बंद आहे — २० विद्यार्थ्यांची मर्यादा पूर्ण झाली आहे.')
      } else if (errorText.includes('email_address_invalid') || errorText.includes('invalid email')) {
        setMessage('Please enter a valid email address.')
      } else if (errorText.includes('email_address_not_authorized')) {
        setMessage('This email cannot be used for registration right now. Please use an authorized email address.')
      } else if (errorText.includes('already registered') || errorText.includes('user already') || errorText.includes('email exists')) {
        setMessage('This email is already registered. Please return to the portal and sign in.')
      } else if (errorText.includes('rate limit') || errorText.includes('over_email_send_rate_limit')) {
        setMessage('Too many registration attempts. Please wait a while and try again.')
      } else if (errorText.includes('password')) {
        setMessage('Please use a stronger password with at least 6 characters.')
      } else {
        setMessage(`Unable to create account (${error.code ?? 'signup_error'}). Please check your email and password, then try again.`)
      }
      return
    }
    setSuccess(true)
  }

  return <main className="min-h-screen bg-secondary/25 px-5 py-8 lg:px-10"><div className="mx-auto max-w-5xl"><header className="flex items-center justify-between border-b border-border bg-card px-5 py-4"><a href="/" className="inline-flex items-center gap-2 font-semibold text-primary"><ArrowLeft size={17} /> Back to CET Cell</a><span className="text-sm font-semibold text-primary">Academic Year 2026-27</span></header><section className="mx-auto mt-12 grid max-w-4xl gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-[.8fr_1.2fr] md:p-10"><div className="flex flex-col justify-center"><p className="text-sm font-bold uppercase tracking-widest text-accent">Candidate account</p><h1 className="mt-3 text-3xl font-bold text-primary">New user registration</h1><p className="mt-4 leading-7 text-muted-foreground">Create your secure account to access CET registration, application forms, hall tickets, and results.</p><div className="mt-6 border border-primary/40 bg-secondary px-4 py-3 text-sm font-semibold leading-6 text-primary">Limited registration: only 20 student seats are available. नोंदणीसाठी फक्त २० विद्यार्थी जागा उपलब्ध आहेत.</div></div>{success ? <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-secondary p-8 text-center"><CheckCircle2 className="text-primary" size={42} /><h2 className="text-xl font-bold text-primary">Check your email</h2><p className="text-sm leading-6 text-muted-foreground">Your account was created. Confirm your email, then return to the home page to sign in.</p><a href="/" className="font-semibold text-primary">Return to sign in</a></div> : <form onSubmit={register} className="flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium">Full name<input required value={fullName} onChange={event => setFullName(event.target.value)} className="rounded-md border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" /></label><label className="flex flex-col gap-2 text-sm font-medium">Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="rounded-md border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" /></label><label className="flex flex-col gap-2 text-sm font-medium">Password<input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="rounded-md border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" /></label><button type="submit" className="mt-2 rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground">Create account</button>{message && <p role="alert" className="text-sm text-destructive">{message}</p>}<p className="text-center text-sm text-muted-foreground">Already registered? <a href="/" className="font-semibold text-primary">Sign in</a></p></form>}</section></div></main>
}
