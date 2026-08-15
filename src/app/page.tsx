import Link from 'next/link';
import { UserPlus, LogIn, ShieldAlert, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Banner Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md shadow-sm">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Important Notice:</span> Admissions for Linux CS Academic Year {new Date().getFullYear()} are currently open. Please register and submit your application with required documents before the due date.
          </div>
        </div>
      </div>

      {/* Main Grid Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Registration Card */}
        <div className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">New Candidate Registration</h2>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Register here if you are applying for the first time for Linux CS admissions. You will receive a unique Application Number upon submission.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2.5 rounded-md text-sm transition-colors w-full text-center"
          >
            Register Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Student Login Card */}
        <div className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 mb-4">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Registered Candidate Login</h2>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Already registered? Login using your email and password to view application status, download hall ticket, or view submitted details.
            </p>
          </div>
          <Link
            href="/student/login"
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-md text-sm transition-colors w-full text-center"
          >
            Candidate Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700" /> Key Guidelines &amp; Instructions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <p className="font-semibold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" /> Photo Specification
            </p>
            Upload recent passport size photograph. Clear background, maximum file size 2MB (JPG/PNG).
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <p className="font-semibold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" /> Academic Details
            </p>
            Ensure SSC and HSC percentage and board details are entered accurately as per official marksheets.
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <p className="font-semibold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" /> Application Number
            </p>
            Keep your generated Application Number (e.g., LCS2026123456) safe for all future references and logins.
          </div>
        </div>
      </div>
    </div>
  );
}
