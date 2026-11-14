'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] App route error:', error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">CET Cell Portal</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-slate-600">We could not load this page. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-md bg-[#0b4778] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#08375d]"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
