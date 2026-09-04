'use client';

import { Printer, ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';

type CetDocumentSheetProps = {
  kind: 'hall-ticket' | 'score-card';
  application: Record<string, unknown>;
};

const value = (application: Record<string, unknown>, key: string) => String(application[key] ?? 'Not available');

export function CetDocumentSheet({ kind, application }: CetDocumentSheetProps) {
  const hallTicket = kind === 'hall-ticket';
  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-foreground print:bg-white print:p-0">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 print:block">
        <div className="flex items-center justify-between print:hidden">
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} /> Back to dashboard</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-slate-300 bg-card px-4 py-2 text-sm font-semibold shadow-sm"><Printer size={16} /> Print / Save PDF</button>
        </div>
        <section className="cet-sheet relative overflow-hidden border border-slate-400 bg-white p-5 shadow-lg print:border-0 print:shadow-none">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]"><span className="rotate-[-28deg] font-serif text-7xl font-bold text-primary">CET CELL</span></div>
          <header className="relative border-b-2 border-slate-700 pb-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Government Examination Document</p>
            <h1 className="mt-2 font-serif text-xl font-bold text-primary">Government of Maharashtra</h1>
            <p className="text-sm font-semibold">State Common Entrance Test Cell, Maharashtra State</p>
            <p className="mt-2 text-base font-bold uppercase">MAH-BHMCT/BCA/BBA/BMS/BBM CET 2026</p>
            <p className="text-xs font-semibold">{hallTicket ? 'Admit Card' : 'Score Card'}</p>
          </header>
          <div className="relative mt-4 grid grid-cols-[1fr_120px] gap-4">
            <div className="border border-slate-500 text-xs">
              {[
                ['Candidate Name', value(application, 'fullName')],
                ['Application Number', value(application, 'applicationNumber')],
                ['Roll Number', hallTicket ? 'Not allotted' : 'Not available'],
                ['Date of Birth', value(application, 'dob')],
                ['Category', value(application, 'category')],
                ['Gender', value(application, 'gender')],
                [hallTicket ? 'Examination Centre' : 'CET Percentile', hallTicket ? 'To be published by CET Cell' : 'Not available'],
                [hallTicket ? 'Examination Date' : 'Date of Result', 'Not available'],
              ].map(([label, item]) => <div key={label} className="grid grid-cols-[42%_58%] border-b border-slate-400 last:border-b-0"><span className="bg-slate-50 p-2 font-semibold">{label}</span><span className="p-2">{item}</span></div>)}
            </div>
            <aside className="flex flex-col gap-3">
              <div className="flex aspect-[3/4] items-center justify-center border border-slate-500 bg-slate-50 text-center text-[10px] text-slate-500">Candidate photograph<br />Not uploaded</div>
              <div className="flex aspect-[3/1] items-center justify-center border border-slate-500 bg-slate-50 text-center text-[10px] text-slate-500">Candidate signature<br />Not uploaded</div>
              <div className="flex aspect-square items-center justify-center border border-slate-500 bg-slate-50"><QrCode size={56} className="text-slate-700" aria-label="Document QR placeholder" /></div>
            </aside>
          </div>
          <div className="relative mt-5 border border-slate-500 p-3 text-xs leading-5"><p className="font-semibold">Important notice</p><p className="text-slate-600">This is a portal preview layout. Official examination details, venue, marks, and result information will be shown only when published by the CET Cell.</p></div>
          <footer className="relative mt-8 flex justify-between border-t border-slate-400 pt-3 text-[10px] text-slate-500"><span>Generated from Student Portal</span><span>Document status: {hallTicket ? 'Not published' : 'Not available'}</span></footer>
        </section>
      </div>
    </main>
  );
}
