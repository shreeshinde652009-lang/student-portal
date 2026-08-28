'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPortal() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  useEffect(() => { createClient().auth.getUser().then(async ({ data }) => { if (!data.user) return window.location.replace('/'); const { data: profile } = await createClient().from('profiles').select('role').eq('id', data.user.id).maybeSingle(); setAllowed(profile?.role === 'admin') }) }, [])
  if (allowed === null) return <main className="grid min-h-screen place-items-center">Loading admin portal...</main>
  if (!allowed) return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold text-primary">Access restricted</h1><p className="mt-2 text-muted-foreground">This portal is available only to administrators.</p><a href="/dashboard" className="mt-5 inline-block rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Back to Student Portal</a></div></main>
  return <main className="min-h-screen bg-secondary/30 p-6"><div className="mx-auto max-w-6xl"><header className="border-b border-border bg-card p-5"><p className="text-sm font-bold uppercase tracking-widest text-accent">Connected Portal</p><h1 className="mt-1 text-3xl font-bold text-primary">Admin Portal</h1><p className="mt-2 text-muted-foreground">Manage students, applications and announcements from the shared Supabase system.</p></header><div className="mt-6 grid gap-4 md:grid-cols-3">{['Student applications','Exam registrations','Portal announcements'].map(item => <section key={item} className="border border-border bg-card p-5"><h2 className="font-bold text-primary">{item}</h2><p className="mt-2 text-sm text-muted-foreground">Connected to the common portal database.</p></section>)}</div></div></main>
}
