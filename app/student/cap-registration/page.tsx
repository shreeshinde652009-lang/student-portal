import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CapRegistrationPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-card px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Student Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">CAP Registration</h1>
        <p className="mt-4 text-muted-foreground">CAP registration will open when enabled by the Admin Portal.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Back to Dashboard</Link>
      </div>
    </main>
  )
}
