import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = { title: 'Linux CS Examination Portal', description: 'Secure Linux CS entrance computer-based examination portal.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${inter.className} min-h-screen bg-slate-100 text-slate-800`}>{children}</body></html>
}
