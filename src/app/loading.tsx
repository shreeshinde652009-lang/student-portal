export default function Loading() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6" aria-label="Loading">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0b4778]" aria-hidden="true" />
        Loading CET Cell portal...
      </div>
    </main>
  )
}
