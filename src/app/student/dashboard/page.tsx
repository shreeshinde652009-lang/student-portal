'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { StudentApplication } from '@/types/student';
import { LogOut, FileText, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/student/login');
        return;
      }

      try {
        const appDoc = await getDoc(doc(db, 'applications', user.uid));
        if (appDoc.exists()) {
          setApplication(appDoc.data() as StudentApplication);
        } else {
          setError('No application record found for this account.');
        }
      } catch (err: unknown) {
        console.error('Error fetching application:', err);
        setError('Failed to fetch application details.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/student/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        <p className="text-sm text-slate-600">Loading your application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white p-6 rounded-lg shadow border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Application Not Found</h2>
        <p className="text-xs text-slate-600">{error || 'Unable to retrieve your registration record.'}</p>
        <button
          onClick={handleLogout}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded font-medium"
        >
          Logout &amp; Return to Login
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> UNDER REVIEW
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> SUBMITTED
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Candidate Portal</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-0.5">Welcome, {application.fullName}</h1>
          <p className="text-xs text-slate-500">Email: {application.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" /> Logout
          </button>
        </div>
      </div>

      {/* Main Status & Application Summary */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Application Number</p>
          <p className="text-3xl font-extrabold text-amber-300 tracking-wider">{application.applicationNumber}</p>
          <p className="text-xs text-blue-100">
            Submitted on: {new Date(application.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 text-center md:text-right space-y-1">
          <p className="text-xs text-blue-200 uppercase font-semibold">Current Application Status</p>
          <div>{getStatusBadge(application.status)}</div>
        </div>
      </div>

      {/* Details Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" /> Submitted Application Record
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Candidate Photo & Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-200 pb-6">
            <div className="w-32 h-40 border-2 border-slate-200 rounded overflow-hidden bg-slate-100 shrink-0">
              {application.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={application.photoUrl} alt={application.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Full Candidate Name</span>
                <span className="font-semibold text-slate-800">{application.fullName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Father&apos;s Name</span>
                <span className="font-semibold text-slate-800">{application.fatherName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Mother&apos;s Name</span>
                <span className="font-semibold text-slate-800">{application.motherName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">{application.dob}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Gender</span>
                <span className="font-semibold text-slate-800">{application.gender}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-800">{application.category}</span>
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div>
            <h3 className="text-xs font-bold text-blue-800 border-b pb-1 mb-3 uppercase tracking-wider">
              Contact &amp; Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Mobile Number</span>
                <span className="font-semibold text-slate-800">{application.mobile}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Email Address</span>
                <span className="font-semibold text-slate-800">{application.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Domicile Certificate No.</span>
                <span className="font-semibold text-slate-800">{application.domicileNumber}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs text-slate-500 block">Residential Address</span>
                <span className="font-medium text-slate-800">{application.address}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">District &amp; State</span>
                <span className="font-medium text-slate-800">{application.district}, {application.state}</span>
              </div>
            </div>
          </div>

          {/* Academic Qualifications */}
          <div>
            <h3 className="text-xs font-bold text-blue-800 border-b pb-1 mb-3 uppercase tracking-wider">
              Educational Qualifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-2 border-b pb-1">SSC (10th) Record</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Board:</span> <span className="font-semibold">{application.sscBoard}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Passing Year:</span> <span className="font-semibold">{application.sscPassingYear}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Percentage:</span> <span className="font-bold text-blue-700">{application.sscPercentage}%</span></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-2 border-b pb-1">HSC (12th) Record</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Board:</span> <span className="font-semibold">{application.hscBoard}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Passing Year:</span> <span className="font-semibold">{application.hscPassingYear}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Percentage:</span> <span className="font-bold text-blue-700">{application.hscPercentage}%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
