'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ScoreCardPage() {
  const [state, setState] = useState<'loading' | 'off' | 'unpublished' | 'empty' | 'ready'>('loading')
  const [application, setApplication] = useState<{ application_number: string; exam_year: number; personal_data: Record<string, string> } | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { window.location.replace('/'); return }
      const { data: settings } = await supabase.from('module_settings').select('key, value').in('key', ['score_card_enabled', 'score_card_published'])
      const values = Object.fromEntries((settings ?? []).map(row => [row.key, row.value])) as Record<string, unknown>
      const enabled = values.score_card_enabled !== false && !(typeof values.score_card_enabled === 'object' && values.score_card_enabled && (values.score_card_enabled as { enabled?: boolean }).enabled === false)
      const published = values.score_card_published === true || (typeof values.score_card_published === 'object' && values.score_card_published && (values.score_card_published as { published?: boolean }).published === true)
      if (!enabled) { setState('off'); return }
      if (!published) { setState('unpublished'); return }
      const { data } = await supabase.from('applications').select('application_number, exam_year, personal_data').eq('user_id', auth.user.id).eq('course_name', 'Linux CS').maybeSingle()
      setApplication(data as typeof application)
      setState(data ? 'ready' : 'empty')
    }
    load()
  }, [])

  if (state === 'loading') return <main className="grid min-h-screen place-items-center">Loading score card...</main>
  if (state === 'off') return <Message title="Score Card is currently unavailable." />
  if (state === 'unpublished') return <Message title="Score Card is not published." />
  if (state === 'empty') return <Message title="No score card was found for your application." />
  return <main className="min-h-screen bg-secondary/30 p-5"><article className="mx-auto max-w-3xl border-2 border-foreground bg-card p-6"><header className="border-b-2 border-foreground pb-5 text-center"><p className="text-xs font-bold uppercase tracking-widest text-primary">Government of Maharashtra</p><h1 className="mt-2 text-2xl font-bold text-primary">State Common Entrance Test Cell</h1><h2 className="mt-3 text-xl font-bold">Score Card</h2><p className="mt-1 font-semibold">Linux CS Examination {application?.exam_year}</p></header><section className="mt-6 grid gap-4 border border-border p-5 sm:grid-cols-2"><Field label="Application Number" value={application?.application_number} /><Field label="Candidate Name" value={application?.personal_data.fullName} /><Field label="Score" value="Result published by examination authority" /><Field label="Result Status" value="Published" /></section><div className="mt-6 flex gap-3 print:hidden"><button onClick={() => window.print()} className="bg-primary px-5 py-3 font-bold text-primary-foreground">Print Score Card</button><a href="/dashboard" className="border border-primary px-5 py-3 font-bold text-primary">Back to Portal</a></div></article></main>
}
function Field({ label, value }: { label: string; value?: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value || '—'}</dd></div> }
function Message({ title }: { title: string }) { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold text-primary">{title}</h1><a href="/dashboard" className="mt-5 inline-block bg-primary px-5 py-3 font-bold text-primary-foreground">Back to Student Portal</a></div></main> }
