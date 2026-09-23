'use client'

import { FormEvent, useState } from 'react'
import { Bot, Loader2, Minimize2, Send, X } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const welcome = 'नमस्कार! मी तुमची Exam आणि Student Portal मध्ये मदत करण्यासाठी येथे आहे. Login, exam instructions, technical problems आणि portal navigation साठी मी मदत करू शकतो.'

export function StudentAiAssistant() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcome }])

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    const message = input.trim()
    if (!message || loading) return
    setInput('')
    setError(null)
    setMessages((current) => [...current, { role: 'user', content: message }])
    setLoading(true)
    try {
      const response = await fetch('/api/student/assistant', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message }) })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || 'Unable to reach the student assistant.')
      setMessages((current) => [...current, { role: 'assistant', content: payload.answer || 'I could not generate a response right now.' }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reach the student assistant.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
    {open && !minimized && <section aria-label="AI Student Help" className="mb-3 flex h-[min(32rem,calc(100vh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-[#173f63] px-4 py-3 text-white"><div className="flex items-center gap-2"><Bot className="size-5 text-amber-300" /><div><h2 className="text-sm font-bold">AI Student Help</h2><p className="text-[11px] text-blue-100">Exam &amp; Student Portal Assistance</p></div></div><div className="flex items-center gap-1"><button type="button" aria-label="Minimize AI Student Help" onClick={() => setMinimized(true)} className="rounded p-1.5 hover:bg-white/10"><Minimize2 className="size-4" /></button><button type="button" aria-label="Close AI Student Help" onClick={() => setOpen(false)} className="rounded p-1.5 hover:bg-white/10"><X className="size-4" /></button></div></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-5 ${message.role === 'user' ? 'rounded-br-sm bg-[#087f78] text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700'}`}>{message.content}</p></div>)}{loading && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="size-4 animate-spin" />Preparing a response...</div>}{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}</div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 bg-white p-3"><label htmlFor="student-ai-message" className="sr-only">Message AI Student Help</label><input id="student-ai-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask in Marathi or English..." className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#087f78] focus:ring-2 focus:ring-[#087f78]/20" /><button type="submit" disabled={!input.trim() || loading} aria-label="Send message" className="rounded-lg bg-[#087f78] px-3 text-white transition hover:bg-[#076b66] disabled:cursor-not-allowed disabled:opacity-50"><Send className="size-4" /></button></form>
    </section>}
    {open && minimized && <button type="button" onClick={() => setMinimized(false)} className="mb-3 rounded-full bg-[#173f63] px-4 py-2 text-sm font-semibold text-white shadow-lg">Open AI Student Help</button>}
    {!open && <button type="button" onClick={() => { setOpen(true); setMinimized(false) }} aria-label="Open AI Student Help" className="flex items-center gap-2 rounded-full bg-[#173f63] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#102f4a] focus:outline-none focus:ring-4 focus:ring-[#173f63]/30"><Bot className="size-5 text-amber-300" />AI Student Help</button>}
  </div>
}
