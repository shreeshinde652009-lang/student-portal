import Link from 'next/link'
import { ClipboardCheck, ShieldCheck } from 'lucide-react'

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f4f7fb]"><header className="border-b border-[#d8e4ed] bg-[#123b5d] text-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><Link href="/" className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-white/10"><ClipboardCheck className="size-5" aria-hidden="true" /></span><span><span className="block text-sm font-bold">Examination Portal</span><span className="block text-xs text-blue-100">Linux CS Entrance Examination</span></span></Link><span className="flex items-center gap-2 text-xs text-blue-100"><ShieldCheck className="size-4" aria-hidden="true" /> Secure CBT system</span></div></header>{children}<footer className="border-t border-[#d8e4ed] px-6 py-5 text-center text-xs text-slate-500">Official examination system · Keep your credentials confidential</footer></div>
}
