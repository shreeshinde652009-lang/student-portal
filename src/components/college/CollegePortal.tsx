'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type College = {
  id: string;
  code: string | null;
  name: string;
  district: string | null;
  address: string | null;
};

type CollegeRequest = {
  id: string;
  college_name: string;
  address: string;
  district: string;
  contact_person: string;
  official_email: string;
  phone_number: string;
  courses_offered: string[];
  status: string;
  created_at: string;
};

type RegistrationForm = {
  college_name: string;
  address: string;
  district: string;
  contact_person: string;
  official_email: string;
  phone_number: string;
};

const requestColumns =
  'id,college_name,address,district,contact_person,official_email,phone_number,courses_offered,status,created_at';

async function fetchApprovedColleges(): Promise<College[]> {
  const { data, error } = await createClient()
    .from('colleges')
    .select('id,code,name,district,address')
    .eq('status', 'approved')
    .order('name');

  if (error) throw error;
  return (data ?? []) as College[];
}

async function fetchCollegeRequests(): Promise<CollegeRequest[]> {
  const { data, error } = await createClient()
    .from('college_registration_requests')
    .select(requestColumns)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CollegeRequest[];
}

export function CollegePortal({ adminReview = false }: { adminReview?: boolean }) {
  return adminReview ? <CollegeRequestReview /> : <ApprovedCollegeDirectory />;
}

function ApprovedCollegeDirectory() {
  const { data: colleges, error, isLoading, mutate } = useSWR(
    'approved-colleges',
    fetchApprovedColleges,
  );

  return (
    <section className="space-y-6" aria-labelledby="college-portal-heading">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#092f52] p-6 text-white">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-[#e8a317]">
            <Building2 aria-hidden="true" size={25} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">CET Cell · Maharashtra State</p>
            <h1 id="college-portal-heading" className="mt-1 text-2xl font-bold">College Portal</h1>
          </div>
        </div>
        <Link
          href="/college/register"
          className="inline-flex items-center gap-2 rounded-md bg-[#e8a317] px-4 py-2.5 text-sm font-semibold text-[#092f52] hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Send aria-hidden="true" size={16} /> Request college access
        </Link>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Approved institutions</p>
          <h2 className="mt-1 text-xl font-bold text-[#092f52]">College directory</h2>
        </div>
        <button
          type="button"
          onClick={() => void mutate()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092f52]"
        >
          <RefreshCw aria-hidden="true" size={15} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600" role="status">
          <Loader2 aria-hidden="true" className="animate-spin" size={18} /> Loading approved colleges…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle aria-hidden="true" size={18} /> Unable to load the college directory. Please try again.
        </div>
      ) : colleges?.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {colleges.map((college) => (
            <li key={college.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-[#092f52]">{college.name}</h3>
                {college.code && <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{college.code}</span>}
              </div>
              {(college.district || college.address) && (
                <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                  <span>{[college.district, college.address].filter(Boolean).join(' · ')}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <Building2 aria-hidden="true" className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 font-semibold text-slate-800">No approved colleges are listed yet.</p>
          <p className="mt-1 text-sm text-slate-600">Submit a request to begin the CET Cell review process.</p>
        </div>
      )}
    </section>
  );
}

function CollegeRequestReview() {
  const { data: requests, error, isLoading, mutate } = useSWR(
    'college-registration-requests',
    fetchCollegeRequests,
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const updateStatus = async (request: CollegeRequest, status: 'approved' | 'rejected') => {
    setUpdatingId(request.id);
    setNotice('');
    setActionError('');

    try {
      const { error: updateError } = await createClient()
        .from('college_registration_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', request.id);

      if (updateError) throw updateError;
      await mutate();
      setNotice(`${request.college_name} request marked ${status}.`);
    } catch {
      setActionError('Unable to update this request. Confirm your administrator access and try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-5" aria-labelledby="college-review-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Administration</p>
          <h2 id="college-review-heading" className="mt-1 text-2xl font-bold text-[#092f52]">College access requests</h2>
          <p className="mt-1 text-sm text-slate-600">Review submitted institution details and set each request status.</p>
        </div>
        <button
          type="button"
          onClick={() => void mutate()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092f52]"
        >
          <RefreshCw aria-hidden="true" size={15} /> Refresh requests
        </button>
      </div>

      {notice && <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
      {actionError && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{actionError}</p>}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600" role="status">
          <Loader2 aria-hidden="true" className="animate-spin" size={18} /> Loading access requests…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertCircle aria-hidden="true" size={18} /> Unable to load requests. Confirm your administrator access and refresh.
        </div>
      ) : requests?.length ? (
        <ul className="space-y-4">
          {requests.map((request) => {
            const isPending = request.status.toLowerCase() === 'pending';
            const isUpdating = updatingId === request.id;

            return (
              <li key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#092f52]">{request.college_name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{request.contact_person} · {request.district}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                    {request.status.toLowerCase() === 'approved' ? <CheckCircle2 aria-hidden="true" size={14} /> : request.status.toLowerCase() === 'rejected' ? <XCircle aria-hidden="true" size={14} /> : <Clock3 aria-hidden="true" size={14} />}
                    {request.status}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Official email</dt><dd className="mt-1 break-all text-slate-800">{request.official_email}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt><dd className="mt-1 text-slate-800">{request.phone_number}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</dt><dd className="mt-1 text-slate-800">{request.address}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Courses offered</dt><dd className="mt-1 text-slate-800">{request.courses_offered?.length ? request.courses_offered.join(', ') : 'Not provided'}</dd></div>
                </dl>

                {isPending && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void updateStatus(request, 'approved')}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                    >
                      {isUpdating ? <Loader2 aria-hidden="true" className="animate-spin" size={16} /> : <CheckCircle2 aria-hidden="true" size={16} />}
                      Approve request
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void updateStatus(request, 'rejected')}
                      className="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                    >
                      <XCircle aria-hidden="true" size={16} /> Decline request
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <Building2 aria-hidden="true" className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 font-semibold text-slate-800">No college access requests yet.</p>
        </div>
      )}
    </section>
  );
}

const emptyForm: RegistrationForm = {
  college_name: '',
  address: '',
  district: '',
  contact_person: '',
  official_email: '',
  phone_number: '',
};

export function CollegeRegistrationForm() {
  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [coursesInput, setCoursesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof RegistrationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitted(false);

    const requiredValues = Object.values(form).map((value) => value.trim());
    if (requiredValues.some((value) => !value)) {
      setError('Complete every required field before submitting.');
      return;
    }

    const coursesOffered = Array.from(
      new Set(coursesInput.split(/[\n,]/).map((course) => course.trim()).filter(Boolean)),
    );

    setIsSubmitting(true);
    try {
      const { error: insertError } = await createClient()
        .from('college_registration_requests')
        .insert({
          ...Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value.trim()]),
          ),
          courses_offered: coursesOffered,
        });

      if (insertError) throw insertError;
      setForm(emptyForm);
      setCoursesInput('');
      setSubmitted(true);
    } catch {
      setError('Unable to submit your request right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 aria-hidden="true" className="mx-auto text-emerald-700" size={40} />
          <h1 className="mt-4 text-2xl font-bold text-[#092f52]">Request received</h1>
          <p className="mt-2 text-sm text-slate-600">The CET Cell will review your college access request.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded-md bg-[#092f52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092f52] focus-visible:ring-offset-2"
            >
              Submit another request
            </button>
            <Link href="/college/login" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              College sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="bg-[#092f52] p-6 text-white md:p-8">
          <Link href="/college/login" className="mb-5 inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ArrowLeft aria-hidden="true" size={16} /> College sign in
          </Link>
          <div className="flex items-center gap-3">
            <Building2 aria-hidden="true" className="text-[#e8a317]" size={28} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">CET Cell · Maharashtra State</p>
              <h1 className="mt-1 text-2xl font-bold">Request college access</h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm text-blue-100">Submit your institution details for review by the State Common Entrance Test Cell.</p>
        </header>

        <form onSubmit={submitRequest} className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 md:col-span-2" role="alert">
              <AlertCircle aria-hidden="true" size={18} /> {error}
            </div>
          )}
          <label htmlFor="college-name" className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
            College name
            <input id="college-name" name="college_name" value={form.college_name} onChange={(event) => updateField('college_name', event.target.value)} autoComplete="organization" maxLength={160} required className="rounded-md border border-slate-300 px-3 py-2.5 font-normal focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label htmlFor="contact-person" className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Contact person
            <input id="contact-person" name="contact_person" value={form.contact_person} onChange={(event) => updateField('contact_person', event.target.value)} autoComplete="name" maxLength={120} required className="rounded-md border border-slate-300 px-3 py-2.5 font-normal focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label htmlFor="official-email" className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Official email
            <input id="official-email" name="official_email" type="email" value={form.official_email} onChange={(event) => updateField('official_email', event.target.value)} autoComplete="email" maxLength={254} required className="rounded-md border border-slate-300 px-3 py-2.5 font-normal focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label htmlFor="phone-number" className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Phone number
            <input id="phone-number" name="phone_number" type="tel" value={form.phone_number} onChange={(event) => updateField('phone_number', event.target.value)} autoComplete="tel" maxLength={32} required className="rounded-md border border-slate-300 px-3 py-2.5 font-normal focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label htmlFor="district" className="grid gap-1.5 text-sm font-semibold text-slate-700">
            District
            <input id="district" name="district" value={form.district} onChange={(event) => updateField('district', event.target.value)} maxLength={100} required className="rounded-md border border-slate-300 px-3 py-2.5 font-normal focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label htmlFor="address" className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
            College address
            <textarea id="address" name="address" value={form.address} onChange={(event) => updateField('address', event.target.value)} autoComplete="street-address" maxLength={500} rows={3} required className="resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label htmlFor="courses-offered" className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
            Courses offered
            <textarea id="courses-offered" name="courses_offered" value={coursesInput} onChange={(event) => setCoursesInput(event.target.value)} rows={3} placeholder="Separate courses with commas or new lines" className="resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal placeholder:text-slate-400 focus:border-[#092f52] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <button disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#092f52] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092f52] focus-visible:ring-offset-2 md:col-span-2">
            {isSubmitting ? <Loader2 aria-hidden="true" className="animate-spin" size={17} /> : <Send aria-hidden="true" size={17} />}
            {isSubmitting ? 'Submitting request…' : 'Submit access request'}
          </button>
        </form>
      </div>
    </main>
  );
}
