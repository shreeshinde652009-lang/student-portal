'use client'

import { useEffect, useState } from 'react'
import { Award, Bell, ClipboardList, FileText, HelpCircle, LogOut, Ticket, UserRound, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const cards = [
  ['CET Registration', 'Register Now', FileText],
  ['Profile', 'Edit Profile', UserRound],
  ['CAP Registration', 'Register Now', ClipboardList],
  ['Option Form', 'Open Option Form', ClipboardList],
  ['MOCK & Psychometric Test', 'Register Now', FileText],
  ['Help Desk', 'Create or Track Issues', Ticket],
  ['Hall Ticket or Admit Card', 'Get Hall Ticket', FileText],
  ['Objection Tracker', 'Track Here', HelpCircle],
  ['Score Card', 'Get Score Card', Award],
  ['ARA', 'Get Details', UserRound],
  ['Notifications', 'Get Details', Bell],
] as const

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [hasRegistration, setHasRegistration] = useState(false)
  const [courseOpen, setCourseOpen] = useState(false)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      if (!data.user) return window.location.replace('/')
      setUser({ id: data.user.id, email: data.user.email })
      const { data: application } = await supabase.from('applications').select('id').eq('user_id', data.user.id).eq('course_name', 'Linux CS').maybeSingle()
      if (active) setHasRegistration(Boolean(application))
    })
    return () => { active = false }
  }, [])

  async function signOut() { await createClient().auth.signOut(); window.location.href = '/' }
  function openCard(title: string) {
    if (title === 'CET Registration') setCourseOpen(true)
    else if (title === 'Re-registration') window.location.href = '/dashboard/linux-cs-registration?mode=edit'
    else if (title === 'CAP Registration') window.location.href = '/student/cap-registration'
    else if (title === 'Option Form') window.location.href = '/student/option-form'
    else if (title === 'Hall Ticket or Admit Card') window.location.href = '/student/hall-ticket'
    else if (title === 'Score Card') window.location.href = '/student/score-card'
    else setActiveCard(title)
  }

  const dashboardCards = hasRegistration
    ? [['Re-registration', 'View / Update Form', FileText], ...cards.filter(([title]) => title !== 'CET Registration')]
    : cards

  return <main className="min-h-screen overflow-hidden border-r-[10px] border-primary bg-white text-foreground">
    <header className="border-b border-slate-200 bg-white/95"><div className="mx-auto flex min-h-[112px] max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8"><a href="/" className="flex items-center gap-3 text-[#12549a]"><img src="/ashoka-emblem.png" alt="Ashoka emblem" className="h-[76px] w-12 object-contain" /><span className="hidden h-[76px] w-px bg-slate-300 sm:block" /><img src="/cet-logo.png" alt="CET Cell logo" className="size-[72px] object-contain" /><span><strong className="block text-base font-medium tracking-wide sm:text-[21px]">GOVERNMENT OF MAHARASHTRA</strong><small className="text-sm font-medium sm:text-base">State Common Entrance Test Cell</small></span></a><div className="flex items-center gap-x-5 gap-y-2 text-[#12549a]"><span className="hidden text-sm font-semibold md:block lg:text-base">Academic Year 2026-27</span><a href="/admin" className="hidden text-sm font-semibold md:block">Admin Portal</a><a href="/exam-portal" className="hidden text-sm font-semibold md:block">Exam Portal</a><button onClick={signOut} aria-label="Sign out" className="rounded-md p-2 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><LogOut size={22} /></button></div></div></header>
    <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-12 sm:px-8 sm:pt-14"><div className="flex justify-end text-base text-[#12549a] sm:text-lg">Hi, <strong className="ml-1 font-semibold">{user?.email?.split('@')[0]?.toUpperCase() ?? 'STUDENT'}</strong></div><div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[.78fr_1.22fr] xl:gap-8"><div className="relative min-h-[360px] sm:min-h-[430px] lg:mt-2 lg:min-h-[520px]"><div aria-hidden="true" className="absolute inset-y-0 left-1 top-0 w-[92%] -rotate-2 rounded-xl bg-[#12549a]" /><img src="/student-portal-photo.png" alt="Students preparing for an entrance examination" className="absolute inset-y-5 left-5 h-[calc(100%-2.5rem)] w-[calc(100%-1.25rem)] rounded-tr-xl object-cover shadow-sm" /></div><div className="grid content-start gap-5 sm:grid-cols-2">{dashboardCards.map(([title, action, Icon]) => <button key={title} onClick={() => openCard(title)} className="flex min-h-[112px] items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-[0_5px_20px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-[#12549a] hover:shadow-[0_8px_24px_rgba(15,23,42,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12549a] sm:px-6"><span className="grid size-14 shrink-0 place-items-center text-[#12549a]"><Icon size={42} strokeWidth={1.7} /></span><span><strong className="block text-base font-semibold leading-tight text-[#303030] sm:text-lg">{title}</strong><small className="mt-1.5 block text-sm font-medium text-[#12549a]">{action} <span aria-hidden="true" className="ml-1">→</span></small></span></button>)}</div></div></div>
    {courseOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-5"><section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="course-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-accent">CET Registration</p><h2 id="course-title" className="mt-2 text-2xl font-bold text-primary">Select examination</h2></div><button onClick={() => setCourseOpen(false)} aria-label="Close"><X /></button></div><button onClick={() => { window.location.href = hasRegistration ? '/dashboard/linux-cs-registration?mode=edit' : '/dashboard/linux-cs-registration' }} className="mt-6 flex w-full items-center justify-between rounded-lg border border-primary bg-secondary px-5 py-4 text-left"><span><strong className="block text-lg text-primary">Linux CS Exam</strong><small className="text-muted-foreground">{hasRegistration ? 'Re-registration form' : 'Open registration form'}</small></span><span className="text-primary">→</span></button></section></div>}
    {activeCard && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-5"><section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-xl"><h2 className="text-2xl font-bold text-primary">{activeCard}</h2><p className="mt-3 text-muted-foreground">This section will be available soon.</p><button onClick={() => setActiveCard(null)} className="mt-6 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Close</button></section></div>}
  </main>
}
