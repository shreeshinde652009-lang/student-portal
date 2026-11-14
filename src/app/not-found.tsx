import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <section className="text-center">
        <p className="text-5xl font-bold text-[#0b4778]">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The requested CET Cell portal page does not exist.</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-[#0b4778] px-5 py-2.5 text-sm font-semibold text-white">
          Return home
        </Link>
      </section>
    </main>
  )
}
