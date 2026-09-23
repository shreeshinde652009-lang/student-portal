'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ResultPage() {
  const [seconds, setSeconds] = useState(10)
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return <main className="mx-auto max-w-2xl px-4 py-8"><section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-800">✓</div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Examination submitted</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Your exam has been submitted successfully.</h1><p className="mt-3 text-sm text-slate-600">Your exam session is now locked. Result, score, and answer review are currently unavailable.</p><div className="mx-auto mt-7 max-w-sm rounded-xl bg-slate-50 p-5 text-sm text-slate-600">The submission confirmation will close in <span className="font-bold text-slate-900">{seconds}s</span>.</div><Link href="/student/dashboard" className="mt-7 inline-block rounded-lg bg-blue-800 px-5 py-3 text-sm font-semibold text-white">Return to dashboard</Link></section></main>
}
