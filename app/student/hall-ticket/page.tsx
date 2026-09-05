'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Application = { application_number: string; exam_year: number; course_name: string; personal_data: Record<string, string>; academic_data: Record<string, string> }

export default function HallTicketPage() {
  const [state, setState] = useState<'loading' | 'off' | 'empty' | 'ready'>('loading')
  const [application, setApplication] = useState<Application | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { window.location.replace('/'); return }
      const { data: setting } = await supabase.from('module_settings').select('value').eq('key', 'hall_ticket_enabled').maybeSingle()
      if (setting?.value === false || (typeof setting?.value === 'object' && setting.value && (setting.value as { enabled?: boolean }).enabled === false)) { setState('off'); return }
      const { data, error: applicationError } = await supabase.from('applications').select('application_number, exam_year, course_name, personal_data, academic_data').eq('user_id', auth.user.id).eq('course_name', 'Linux CS').maybeSingle()
      if (applicationError) { setError(applicationError.message); setState('empty'); return }
      setApplication(data as Application | null)
      setState(data ? 'ready' : 'empty')
    }
    load()
  }, [])

  if (state === 'loading') return <main className="grid min-h-screen place-items-center">Loading hall ticket...</main>
  if (state === 'off') return <Message title="Hall Ticket is currently unavailable." />
  if (state === 'empty') return <Message title={error || 'No submitted application was found.'} />
  const details = application?.personal_data ?? {}
  const academic = application?.academic_data ?? {}
  return <main className="min-h-screen bg-secondary/30 p-5"><article className="mx-auto max-w-4xl border-2 border-foreground bg-card p-6 shadow-sm print:shadow-none"><header className="border-b-2 border-foreground pb-5 text-center"><p className="text-xs font-bold uppercase tracking-widest text-primary">Government of Maharashtra</p><h1 className="mt-2 text-2xl font-bold text-primary">State Common Entrance Test Cell</h1><h2 className="mt-3 text-xl font-bold">Hall Ticket / Admit Card</h2><p className="mt-1 font-semibold">Linux CS Examination {application?.exam_year}</p></header><section className="mt-6 grid gap-3 border border-border p-4 sm:grid-cols-2"><Field label="Application Number" value={application?.application_number} /><Field label="Candidate Name" value={details.fullName} /><Field label="Date of Birth" value={details.dateOfBirth} /><Field label="Gender" value={details.gender} /><Field label="Exam Centre" value={academic.examCenter} /><Field label="Mobile" value={details.mobile} /></section><section className="mt-6 border border-border p-4"><h3 className="font-bold text-primary">Instructions</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6"><li>Carry this hall ticket and a valid photo identity document.</li><li>Reach the examination centre before the reporting time.</li><li>Follow all instructions issued by the examination authority.</li></ol></section><div className="mt-6 flex gap-3 print:hidden"><button onClick={() => window.print()} className="bg-primary px-5 py-3 font-bold text-primary-foreground">Print Hall Ticket</button><a href="/dashboard" className="border border-primary px-5 py-3 font-bold text-primary">Back to Portal</a></div></article></main>
}

function Field({ label, value }: { label: string; value?: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value || '—'}</dd></div> }
function Message({ title }: { title: string }) { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold text-primary">{title}</h1><a href="/dashboard" className="mt-5 inline-block bg-primary px-5 py-3 font-bold text-primary-foreground">Back to Student Portal</a></div></main> }
