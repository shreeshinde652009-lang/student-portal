'use client';

import Link from 'next/link';
import { ArrowUpRight, FileCheck2, GraduationCap, Ticket } from 'lucide-react';

type CetDocumentCardProps = {
  kind: 'hall-ticket' | 'score-card';
  applicationNumber?: string;
  available: boolean;
};

export function CetDocumentCard({ kind, applicationNumber, available }: CetDocumentCardProps) {
  const isHallTicket = kind === 'hall-ticket';
  return (
    <article className="group border border-slate-300 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center bg-primary/10 text-primary">
            {isHallTicket ? <Ticket aria-hidden="true" /> : <GraduationCap aria-hidden="true" />}
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">CET 2026</p>
            <h3 className="font-serif text-lg font-bold text-foreground">{isHallTicket ? 'Hall Ticket' : 'Score Card'}</h3>
          </div>
        </div>
        <FileCheck2 className={available ? 'text-emerald-600' : 'text-muted-foreground'} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-4 px-5 py-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {available ? 'Your application-linked document is ready to view.' : 'This document will appear after the CET Cell publishes it.'}
        </p>
        <div className="flex items-center justify-between border-t border-dashed border-slate-300 pt-3 font-mono text-[11px] text-muted-foreground">
          <span>APP NO. {applicationNumber || '—'}</span>
          {available ? (
            <Link className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-primary hover:underline" href={`/student/${kind}`}>
              Open <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ) : <span>NOT PUBLISHED</span>}
        </div>
      </div>
    </article>
  );
}
