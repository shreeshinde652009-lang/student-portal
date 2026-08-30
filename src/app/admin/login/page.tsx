'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both admin email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } = await createClient().auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      const { data: profile } = await createClient().from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role !== 'admin') throw new Error('Admin access denied.');
      sessionStorage.setItem('isAdmin', 'true');
      window.location.href = '/admin/dashboard';
    } catch (err: unknown) {
      console.error('Admin login error:', err);
      const authError = err as { message?: string };
      setError(authError.message || 'Invalid admin credentials or access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-6 text-center border-b-4 border-amber-500">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-amber-400" />
          <h1 className="text-xl font-bold uppercase tracking-wide">Admin Portal Login</h1>
          <p className="text-xs text-slate-300 mt-1">State Common Entrance Test Cell</p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mahacet.org"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Authenticating...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" /> Access Admin Console
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            <Link href="/" className="hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
