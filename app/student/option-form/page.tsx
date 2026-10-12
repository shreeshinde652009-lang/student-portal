import Link from 'next/link'

export default function OptionFormPage() {
  return (
    <main className="min-h-screen bg-card px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Student Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Option Form</h1>
        <p className="mt-4 text-muted-foreground">Option form will open when enabled by the Admin Portal.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Back to Dashboard</Link>
      </div>
    </main>
  )
}
