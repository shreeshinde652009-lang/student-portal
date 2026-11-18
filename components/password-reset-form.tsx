'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PasswordResetForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password })
      if (updateError) {
        setError('Unable to update the password. Request a new reset link and try again.')
        return
      }

      setPassword('')
      setConfirmPassword('')
      setMessage('Your password has been updated. You can now return to the student portal.')
    } catch {
      setError('Unable to update the password. Request a new reset link and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <label htmlFor="new-password" className="flex flex-col gap-1.5 text-sm text-[#454545]">
        New password
        <input
          id="new-password"
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
        />
      </label>
      <label htmlFor="confirm-password" className="flex flex-col gap-1.5 text-sm text-[#454545]">
        Confirm new password
        <input
          id="confirm-password"
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
        />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {message && <p role="status" className="text-sm text-[#15549a]">{message}</p>}
      {!message && (
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 rounded-[10px] bg-[#15549a] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#10477f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a] disabled:opacity-60"
        >
          {loading ? 'Updating password...' : 'Update password'}
        </button>
      )}
      {message && <a href="/dashboard" className="text-center text-sm font-semibold text-[#15549a] underline-offset-4 hover:underline">Return to the student portal</a>}
    </form>
  )
}
