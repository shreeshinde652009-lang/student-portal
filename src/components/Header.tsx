import Link from 'next/link';
import { Shield, User, Lock, Home, FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md">
      {/* Top Bar */}
      <div className="border-b border-blue-700/50 bg-blue-950/40 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2 font-medium">
            <span>Government of Maharashtra / State Common Entrance Test Cell</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:underline flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <Link href="/register" className="hover:underline flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> New Registration
            </Link>
            <Link href="/student/login" className="hover:underline flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Candidate Login
            </Link>
            <Link href="/admin/login" className="hover:underline flex items-center gap-1 text-amber-300">
              <Lock className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center p-2 border-2 border-amber-400 shrink-0">
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide uppercase text-amber-300">
              State Common Entrance Test Cell
            </h1>
            <p className="text-sm md:text-base text-blue-100 font-medium">
              Linux CS Entrance &amp; Admission Portal
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              Government of Maharashtra Academic Year Admissions
            </p>
          </div>
        </div>

        {/* Quick Links / Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-800/80 border border-blue-600 rounded-lg px-3 py-1.5 text-center">
            <p className="text-xs text-blue-200">Helpline</p>
            <p className="text-sm font-semibold text-amber-300">+91 1800-22-1234</p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-blue-950 border-t border-blue-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-6 text-sm font-medium">
          <Link href="/" className="text-white hover:text-amber-300 transition-colors">
            Home
          </Link>
          <Link href="/register" className="text-white hover:text-amber-300 transition-colors">
            Candidate Registration
          </Link>
          <Link href="/student/login" className="text-white hover:text-amber-300 transition-colors">
            Candidate Login
          </Link>
          <Link href="/student/dashboard" className="text-white hover:text-amber-300 transition-colors">
            Student Dashboard
          </Link>
          <Link href="/admin/login" className="text-amber-300 hover:text-amber-200 transition-colors ml-auto">
            Admin Portal Access
          </Link>
        </div>
      </nav>
    </header>
  );
}
