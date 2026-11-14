'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-800">
        <main className="min-h-screen flex items-center justify-center p-6">
          <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">CET Cell Portal</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">The portal needs to reload</h1>
            <p className="mt-3 text-slate-600">A temporary application error occurred.</p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-md bg-[#0b4778] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#08375d]"
            >
              Reload portal
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
