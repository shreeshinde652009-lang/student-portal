'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { StudentAuthShell } from '@/components/student-auth-shell'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)

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
      setCanResend(errorText.includes('rate limit') || errorText.includes('already registered') || errorText.includes('user already') || errorText.includes('email exists') || errorText.includes('over_email_send_rate_limit'))
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
    setCanResend(false)
  }

  async function resendConfirmation() {
    setResending(true)
    setMessage('')
    const { error } = await createClient().auth.resend({ type: 'signup', email })
    setResending(false)
    setMessage(error ? 'Unable to resend confirmation right now. Please wait and try again.' : 'Confirmation email sent. Please check your inbox.')
  }

  return (
    <StudentAuthShell>
      <section className="rounded-[18px] border border-[#dedede] bg-white px-5 py-6 shadow-[0_4px_18px_rgba(0,0,0,0.04)] sm:px-8 sm:py-7">
        <div className="mx-auto max-w-[520px]">
          <a href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#15549a] underline-offset-4 hover:underline">Back to CET Cell</a>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#15549a]">Candidate account</p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-[#343434]">New user registration</h1>
          <p className="mt-3 text-sm leading-6 text-[#626262]">Create your secure account to access CET registration, application forms, hall tickets, and results.</p>

          <div className="mt-5 rounded-lg border border-[#cbd9eb] bg-[#f1f6fc] px-4 py-3 text-sm font-medium leading-6 text-[#15549a]">
            Limited registration: only 20 student seats are available. <span lang="mr" className="registration-marathi">नोंदणीसाठी फक्त २० विद्यार्थी जागा उपलब्ध आहेत.</span>
          </div>

          {canResend && (
            <button
              type="button"
              onClick={resendConfirmation}
              disabled={resending}
              className="mt-4 w-full rounded-lg border border-[#15549a] bg-white px-4 py-3 text-left text-sm font-semibold text-[#15549a] transition hover:bg-[#f4f7fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a] disabled:opacity-60"
            >
              {resending ? 'Sending confirmation...' : 'Already registered or rate-limited? Resend confirmation email'}
            </button>
          )}

          {success ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-[#dce6f2] bg-[#f7faff] p-7 text-center">
              <CheckCircle2 aria-hidden="true" className="size-11 text-[#15549a]" />
              <h2 className="text-xl font-semibold text-[#343434]">Check your email</h2>
              <p className="text-sm leading-6 text-[#626262]">Your account was created. Confirm your email, then return to the home page to sign in.</p>
              <a href="/" className="font-semibold text-[#15549a] underline-offset-4 hover:underline">Return to sign in</a>
            </div>
          ) : (
            <form onSubmit={register} className="mt-5 flex flex-col gap-4">
              <label htmlFor="register-full-name" className="flex flex-col gap-1.5 text-sm text-[#454545]">
                Full name
                <input
                  id="register-full-name"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
                />
              </label>
              <label htmlFor="register-email" className="flex flex-col gap-1.5 text-sm text-[#454545]">
                Email address
                <input
                  id="register-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
                />
              </label>
              <label htmlFor="register-password" className="flex flex-col gap-1.5 text-sm text-[#454545]">
                Password
                <input
                  id="register-password"
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
                />
              </label>
              <button type="submit" className="mt-1 min-h-11 rounded-[10px] bg-[#15549a] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#10477f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a]">
                Create account
              </button>
              {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
              <p className="text-center text-sm text-[#626262]">Already registered? <a href="/" className="font-semibold text-[#15549a] underline-offset-4 hover:underline">Sign in</a></p>
            </form>
          )}
        </div>
      </section>
    </StudentAuthShell>
  )
}
