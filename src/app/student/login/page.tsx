'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/student/dashboard';
    } catch (err: unknown) {
      console.error('Login error:', err);
      const authError = err as { code?: string; message?: string };
      if (
        authError.code === 'auth/invalid-credential' ||
        authError.code === 'auth/user-not-found' ||
        authError.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(authError.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 text-white p-6 text-center">
          <UserCheck className="w-12 h-12 mx-auto mb-2 text-amber-400" />
          <h1 className="text-xl font-bold uppercase tracking-wide">Candidate Login</h1>
          <p className="text-xs text-blue-200 mt-1">Linux CS Entrance Portal</p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                </>
              ) : (
                'Login to Application Dashboard'
              )}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-600 space-y-2">
            <p>
              New applicant?{' '}
              <Link href="/register" className="text-blue-700 font-semibold hover:underline">
                Register New Application
              </Link>
            </p>
            <p>
              <Link href="/" className="text-slate-500 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Home Page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
