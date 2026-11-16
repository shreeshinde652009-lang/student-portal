import Link from 'next/link';
import { ArrowUpRight, FileCheck2, LockKeyhole } from 'lucide-react';

type CetDocumentCardProps = {
  kind: 'hall-ticket' | 'score-card';
  applicationNumber: string;
  available: boolean;
  published?: boolean;
};

export function CetDocumentCard({ kind, applicationNumber, available, published = true }: CetDocumentCardProps) {
  const isPublished = available && published;
  const title = kind === 'hall-ticket' ? 'Hall Ticket' : 'Score Card';
  const href = kind === 'hall-ticket' ? '/student/hall-ticket' : '/student/score-card';

  return (
    <article className="flex flex-col justify-between gap-5 border border-slate-300 bg-card p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <span className={`flex size-11 shrink-0 items-center justify-center ${isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {isPublished ? <FileCheck2 size={21} aria-hidden="true" /> : <LockKeyhole size={20} aria-hidden="true" />}
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Official CET document</p>
          <h3 className="mt-1 font-serif text-xl font-bold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Application {applicationNumber}</p>
          <p className={`mt-2 text-xs font-semibold ${isPublished ? 'text-emerald-700' : 'text-amber-700'}`} role="status">
            {isPublished ? 'Published by the CET Cell' : available ? 'Awaiting publication' : 'Currently unavailable'}
          </p>
        </div>
      </div>
      {isPublished ? <Link href={href} className="inline-flex items-center justify-center gap-2 border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">View document<ArrowUpRight size={15} aria-hidden="true" /></Link> : <span className="text-sm text-muted-foreground">No action required</span>}
    </article>
  );
}
