'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { HallTicketAdminPanel } from '@/components/admin/HallTicketAdminPanel'

type Application = { id: string; application_number?: string; status?: string; personal_data?: Record<string, unknown>; academic_data?: Record<string, unknown>; created_at?: string }
type DocumentRecord = { id: string; application_id: string; document_type?: string; file_name?: string; storage_path: string; signedUrl?: string; storageError?: string }

export default function ApplicationReviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/admin/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!['admin', 'super_admin'].includes(profile?.role)) { router.replace('/admin/login'); return }
      const { data, error } = await supabase.from('applications').select('id, application_number, status, personal_data, academic_data, created_at').eq('id', applicationId).single()
      if (error) { setMessage(`Application unavailable: ${error.message}`); setLoading(false); return }
      setApplication(data)
      console.log('ADMIN DOCUMENT DEBUG: application_id', applicationId)
      const { data: documentRows, error: documentError } = await supabase.from('documents').select('id, application_id, document_type, file_name, storage_path').eq('application_id', applicationId)
      console.log('ADMIN DOCUMENT DEBUG: documents query result', documentRows)
      if (documentError) console.error('ADMIN DOCUMENT DEBUG: documents query error', documentError)
      if (documentError) setMessage(`Documents unavailable: ${documentError.message}`)
      const resolved = await Promise.all((documentRows ?? []).map(async (document) => {
        const bucket = 'documents'
        const { data: signed, error: storageError } = await supabase.storage.from(bucket).createSignedUrl(document.storage_path, 3600)
        if (storageError) {
          console.error('ADMIN DOCUMENT DEBUG: signed URL error', { document, storageError })
          return { ...document, storageError: storageError.message }
        }
        return { ...document, signedUrl: signed.signedUrl }
      }))
      setDocuments(resolved)
      setLoading(false)
    }
    load()
  }, [applicationId, router])

  const updateStatus = async (status: string) => {
    if (!application) return
    const { error } = await createClient().from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', application.id)
    if (error) setMessage('Unable to update status. Check Supabase permissions.')
    else { setApplication({ ...application, status }); setMessage(`Application marked ${status.toLowerCase()}.`) }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading application...</main>
  if (!application) return <main className="min-h-screen bg-slate-50 p-8"><button onClick={() => router.back()} className="text-blue-700">Back</button><p className="mt-8 text-red-700">{message}</p></main>
  const fields = { ...application.personal_data, ...application.academic_data }
  const documentLabel = (type?: string) => ({ photo: 'Photograph', photograph: 'Photograph', signature: 'Signature', marksheet: 'Marksheet / Certificate', certificate: 'Marksheet / Certificate' }[type?.toLowerCase() || ''] || type || 'Document')
  return <main className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="max-w-5xl mx-auto"><button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-blue-700 mb-6"><ArrowLeft size={16} /> Back to applications</button><div className="bg-white border border-slate-200 rounded-lg"><div className="p-6 border-b flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">Application review</p><h1 className="text-2xl font-bold text-[#092f52]">{String(fields.fullName || fields.full_name || 'Candidate')}</h1><p className="text-sm text-slate-500 mt-1">{application.application_number || application.id}</p></div><span className="rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold">{application.status || 'submitted'}</span></div><div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{Object.entries(fields).map(([key, value]) => <div key={key}><p className="text-xs uppercase text-slate-400">{key.replaceAll('_', ' ')}</p><p className="mt-1 font-medium break-words">{String(value || 'Not provided')}</p></div>)}</div><HallTicketAdminPanel applicationId={application.id} applicationNumber={application.application_number} candidateName={String(fields.fullName || fields.full_name || '')} /><section className="p-6 border-t" aria-labelledby="documents-heading"><h2 id="documents-heading" className="text-lg font-semibold text-[#092f52]">Documents</h2>{documents.length === 0 && <p className="mt-3 text-sm text-slate-500">No document records returned for application_id {applicationId}.</p>}<div className="mt-4 grid gap-3">{documents.map((document) => <article key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-4"><div className="flex items-center gap-3"><FileText size={20} className="text-slate-500" /><div><p className="font-medium">{documentLabel(document.document_type)}</p><p className="text-xs text-slate-500">{document.file_name || document.storage_path}</p><p className="text-[11px] text-slate-400">application_id: {document.application_id}</p></div></div>{document.signedUrl ? <a href={document.signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white">View/Open <ExternalLink size={15} /></a> : <p className="text-sm text-red-700">Storage error: {document.storageError || 'Signed URL unavailable'}</p>}</article>)}</div></section><div className="p-6 border-t flex flex-wrap gap-3"><button onClick={() => updateStatus('verified')} className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-semibold"><CheckCircle2 size={16} className="inline mr-2" />Confirm</button><button onClick={() => updateStatus('rejected')} className="border border-red-300 text-red-700 rounded-md px-4 py-2 text-sm font-semibold"><XCircle size={16} className="inline mr-2" />Reject</button></div>{message && <p className="px-6 pb-6 text-sm text-slate-600">{message}</p>}</div></div></main>
}
