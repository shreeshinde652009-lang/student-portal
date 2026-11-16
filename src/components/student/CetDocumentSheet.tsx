'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

type DocumentKind = 'hall-ticket' | 'score-card';
type CetDocumentSheetProps = {
  kind: DocumentKind;
  application: Record<string, unknown>;
};

type Detail = { label: string; value: unknown };

function firstValue(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (Array.isArray(value)) return value.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function getDetails(kind: DocumentKind, application: Record<string, unknown>): Detail[] {
  if (kind === 'hall-ticket') {
    return [
      { label: 'Candidate name', value: firstValue(application, 'candidate_name', 'fullName', 'full_name') },
      { label: 'Application number', value: firstValue(application, 'application_number', 'applicationNumber') },
      { label: 'Roll number', value: firstValue(application, 'roll_number') },
      { label: 'Examination', value: firstValue(application, 'exam_name', 'examName') },
      { label: 'Examination date', value: firstValue(application, 'exam_date') },
      { label: 'Reporting time', value: firstValue(application, 'reporting_time') },
      { label: 'Examination time', value: firstValue(application, 'exam_time') },
      { label: 'Gate closing time', value: firstValue(application, 'gate_closing_time') },
      { label: 'Examination centre', value: firstValue(application, 'exam_center_name') },
      { label: 'Centre code', value: firstValue(application, 'venue_code') },
      { label: 'Centre address', value: firstValue(application, 'exam_center_address') },
      { label: 'Question paper language', value: firstValue(application, 'question_paper_language') },
    ];
  }

  return [
    { label: 'Candidate name', value: firstValue(application, 'fullName', 'full_name', 'candidate_name') },
    { label: 'Application number', value: firstValue(application, 'application_number', 'applicationNumber') },
    { label: 'Examination status', value: firstValue(application, 'exam_status') },
    { label: 'Marks obtained', value: firstValue(application, 'obtained_marks') },
    { label: 'Total marks', value: firstValue(application, 'total_marks') },
    { label: 'Percentage', value: firstValue(application, 'percentage') },
    { label: 'Grade', value: firstValue(application, 'grade') },
    { label: 'Result', value: firstValue(application, 'result') },
  ];
}

export function CetDocumentSheet({ kind, application }: CetDocumentSheetProps) {
  const title = kind === 'hall-ticket' ? 'Examination Hall Ticket' : 'CET Score Card';
  const details = getDetails(kind, application);
  const instructions = kind === 'hall-ticket' ? firstValue(application, 'instructions') : null;
  const subjects = kind === 'score-card' ? firstValue(application, 'subjects') : null;
  const subjectRows = Array.isArray(subjects) ? subjects.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null) : [];

  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-foreground print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} aria-hidden="true" />Back to dashboard</Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Printer size={16} aria-hidden="true" />Print or save as PDF</button>
        </div>
        <article className="border-2 border-slate-700 bg-white p-6 shadow-sm sm:p-10 print:border print:p-8 print:shadow-none">
          <header className="border-b-2 border-slate-800 pb-5 text-center">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Maharashtra State Common Entrance Test Cell</p>
            <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Official candidate document</p>
          </header>

          <section className="mt-7" aria-label="Candidate and examination details">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {details.map(({ label, value }) => <div key={label} className="border-b border-dashed border-slate-300 pb-2"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-900">{displayValue(value)}</dd></div>)}
            </dl>
          </section>

          {subjectRows.length > 0 && <section className="mt-8"><h2 className="font-serif text-lg font-bold">Subject-wise marks</h2><div className="mt-3 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr className="bg-slate-100"><th scope="col" className="border border-slate-300 p-2">Subject</th><th scope="col" className="border border-slate-300 p-2">Marks obtained</th><th scope="col" className="border border-slate-300 p-2">Total marks</th></tr></thead><tbody>{subjectRows.map((subject, index) => <tr key={String(subject.id ?? subject.name ?? index)}><td className="border border-slate-300 p-2">{displayValue(firstValue(subject, 'name', 'subject'))}</td><td className="border border-slate-300 p-2">{displayValue(firstValue(subject, 'obtained_marks', 'score', 'marks'))}</td><td className="border border-slate-300 p-2">{displayValue(firstValue(subject, 'total_marks', 'maximum_marks'))}</td></tr>)}</tbody></table></div></section>}

          {instructions && <section className="mt-8 border border-slate-300 p-4"><h2 className="font-serif text-lg font-bold">Important instructions</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">{(Array.isArray(instructions) ? instructions : [instructions]).map((instruction, index) => <li key={index}>{displayValue(instruction)}</li>)}</ul></section>}
          <footer className="mt-10 border-t border-slate-300 pt-4 text-center text-[10px] text-slate-500">Keep this document available for verification. Contact the CET Cell if any details appear incorrect.</footer>
        </article>
      </div>
    </main>
  );
}
