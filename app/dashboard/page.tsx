'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Bell, FileText, LogOut, UserRound, Ticket, ClipboardList, HelpCircle, Award, X, Download, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const cards = [
  ['CET Registration', 'Register Now', FileText], ['Profile', 'Edit Profile', UserRound],
  ['CAP Registration', 'Register Now', ClipboardList], ['MOCK & Psychometric Test', 'Register Now', FileText],
  ['Help Desk', 'Create or Track Issues', Ticket], ['Hall Ticket or Admit Card', 'Get Hall Ticket', FileText],
  ['Objection Tracker', 'Track Here', HelpCircle], ['Score Card', 'Get Score Card', Award],
  ['ARA', 'Get Details', UserRound], ['Notifications', 'Get Details', Bell],
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    createClient().auth.getUser().then(({ data }) => {
      if (!active) return
      if (!data.user) {
        window.location.replace('/')
        return
      }
      setUser(data.user)
    })
    return () => { active = false }
  }, [])
  async function signOut() { await createClient().auth.signOut(); window.location.href = '/' }
  function openCard(title: string) { if (title === 'Profile') setProfileOpen(true); else setActiveCard(title) }
  async function saveProfile() { if (!user) return; await createClient().from('profiles').upsert({ id: (await createClient().auth.getUser()).data.user?.id, full_name: fullName, mobile }); setSaved(true) }

  return <main className="min-h-screen bg-card text-foreground"><header className="border-b border-border"><div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-4"><a href="/" className="flex items-center gap-3 text-primary"><img src="/ashoka-emblem.png" alt="Ashoka emblem" className="h-16 w-10 object-contain" /><span className="hidden h-14 w-px bg-border sm:block" /><img src="/cet-logo.png" alt="CET Cell logo" className="size-16 object-contain" /><span><strong className="block text-lg sm:text-2xl">GOVERNMENT OF MAHARASHTRA</strong><small className="font-semibold">State Common Entrance Test Cell</small></span></a><div className="flex items-center gap-3 text-primary"><span className="hidden text-sm font-semibold md:block">Academic Year 2026-27</span><button onClick={signOut} aria-label="Sign out"><LogOut /></button></div></div></header><div className="mx-auto max-w-[1280px] px-5 py-8"><div className="flex justify-end text-primary"><span>Hi, <strong>{user?.email?.split('@')[0]?.toUpperCase() ?? 'STUDENT'}</strong></span></div><div className="mt-8 grid gap-8 lg:grid-cols-[.72fr_1.5fr]"><div className="relative min-h-[520px] overflow-hidden rounded-bl-xl rounded-tr-xl bg-primary"><img src="/student-portal-photo.png" alt="Students preparing for an entrance examination" className="absolute inset-0 size-full object-cover" /></div><div className="grid gap-5 sm:grid-cols-2">{cards.map(([title, action, Icon]) => <button key={title as string} onClick={() => openCard(title as string)} className="flex min-h-28 items-center gap-5 rounded-xl border border-border bg-card p-5 text-left shadow-md transition hover:-translate-y-1 hover:border-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span className="grid size-14 shrink-0 place-items-center text-primary"><Icon size={42} strokeWidth={1.8} /></span><span><strong className="block text-lg leading-tight">{title as string}</strong><small className="mt-2 block font-semibold text-primary">{action as string} <ArrowRight className="inline" size={15} /></small></span></button>)}</div></div></div>{activeCard && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"><div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-primary">{activeCard}</h2><button onClick={() => setActiveCard(null)} aria-label="Close"><X /></button></div>{activeCard === 'CET Registration' ? <div className="mt-6 rounded-lg border border-border p-5"><p className="font-semibold text-primary">Technical Education · UG</p><h3 className="mt-4 text-lg font-bold">Linux CS Exam</h3><button className="mt-4 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">Register Now <ArrowRight className="inline" size={16} /></button></div> : activeCard === 'Hall Ticket or Admit Card' ? <div className="mt-6 rounded-lg bg-secondary p-5"><p className="font-semibold">Hall ticket is not published yet.</p><small className="mt-2 block text-muted-foreground">It will appear here after the CET Cell administrator publishes it.</small></div> : <p className="mt-6 rounded-lg bg-secondary p-5">This CET Cell service is available for your account. Further details will appear here.</p>}</div></div>}{profileOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"><div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-primary">Edit Profile</h2><button onClick={() => setProfileOpen(false)} aria-label="Close"><X /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 font-semibold">Full name<input value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-md border border-border p-3 font-normal" /></label><label className="grid gap-2 font-semibold">Mobile number<input value={mobile} onChange={e => setMobile(e.target.value)} className="rounded-md border border-border p-3 font-normal" /></label></div><button onClick={saveProfile} className="mt-6 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground"><Save className="mr-2 inline" size={16} />Save changes</button>{saved && <p className="mt-3 text-sm font-semibold text-primary">Profile saved successfully.</p>}</div></div>}</main>
}
