'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Application = { id: string; application_number: string; course_name: string; exam_year: number; status: string; submitted_at: string; user_id: string; personal_data: { fullName?: string; email?: string; mobile?: string } }
type DocumentRow = { id: string; application_id: string; document_type: string; file_name: string; storage_path: string }

export default function AdminPortal() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [documents, setDocuments] = useState<Record<string, DocumentRow[]>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { window.location.replace('/'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
      const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
      setAllowed(isAdmin)
      if (!isAdmin) return
      const { data, error: applicationError } = await supabase.from('applications').select('id, application_number, course_name, exam_year, status, submitted_at, user_id, personal_data').order('submitted_at', { ascending: false })
      if (applicationError) { setError('Applications could not be loaded. Check Admin RLS policies.'); return }
      const rows = (data ?? []) as Application[]
      setApplications(rows)
      const { data: docs } = await supabase.from('documents').select('id, application_id, document_type, file_name, storage_path').in('application_id', rows.map(row => row.id))
      const grouped: Record<string, DocumentRow[]> = {}
      for (const document of (docs ?? []) as DocumentRow[]) {
        if (!grouped[document.application_id]) grouped[document.application_id] = []
        grouped[document.application_id].push(document)
      }
      setDocuments(grouped)
    }
    load()
  }, [])

  if (allowed === null) return <main className="grid min-h-screen place-items-center">Loading admin portal...</main>
  if (!allowed) return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold text-primary">Access restricted</h1><p className="mt-2 text-muted-foreground">This portal is available only to administrators.</p><a href="/dashboard" className="mt-5 inline-block rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Back to Student Portal</a></div></main>

  return <main className="min-h-screen bg-secondary/30 p-6"><div className="mx-auto max-w-7xl"><header className="border-b border-border bg-card p-5"><p className="text-sm font-bold uppercase tracking-widest text-accent">Government of Maharashtra · CET Cell</p><h1 className="mt-1 text-3xl font-bold text-primary">Admin Portal</h1><p className="mt-2 text-muted-foreground">Student applications and uploaded documents from the shared Supabase system.</p></header>{error && <p className="mt-5 border border-destructive bg-card p-4 text-destructive">{error}</p>}<section className="mt-6 overflow-x-auto border border-border bg-card"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-secondary text-primary"><tr><th className="p-3">Application</th><th className="p-3">Candidate</th><th className="p-3">Course / Year</th><th className="p-3">Status</th><th className="p-3">Documents</th><th className="p-3">Submitted</th></tr></thead><tbody>{applications.map(application => <tr key={application.id} className="border-t border-border"><td className="p-3 font-bold">{application.application_number}</td><td className="p-3">{application.personal_data?.fullName || '—'}<br /><span className="text-xs text-muted-foreground">{application.personal_data?.email || '—'}</span></td><td className="p-3">{application.course_name}<br />{application.exam_year}</td><td className="p-3"><span className="font-bold text-primary">{application.status}</span></td><td className="p-3">{(documents[application.id] ?? []).length ? <div className="flex flex-wrap gap-2">{documents[application.id].map(document => <DocumentLink key={document.id} document={document} />)}</div> : <span className="text-muted-foreground">No documents</span>}</td><td className="p-3">{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString('en-IN') : '—'}</td></tr>)}{applications.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No applications found.</td></tr>}</tbody></table></section></div></main>
}

function DocumentLink({ document }: { document: DocumentRow }) {
  const [url, setUrl] = useState('')
  useEffect(() => { createClient().storage.from('documents').createSignedUrl(document.storage_path, 3600).then(({ data }) => { if (data?.signedUrl) setUrl(data.signedUrl) }) }, [document.storage_path])
  return url ? <a href={url} target="_blank" rel="noreferrer" className="border border-primary px-2 py-1 font-semibold text-primary underline">{document.document_type}</a> : <span className="border border-border px-2 py-1 text-muted-foreground">{document.document_type} unavailable</span>
}
