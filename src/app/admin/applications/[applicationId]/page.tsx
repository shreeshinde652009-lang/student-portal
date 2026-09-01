'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Application = { id: string; application_number?: string; status?: string; personal_data?: Record<string, unknown>; academic_data?: Record<string, unknown>; created_at?: string }

export default function ApplicationReviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
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
      if (error) setMessage('Application not found or unavailable.')
      else setApplication(data)
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
  return <main className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="max-w-5xl mx-auto"><button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-blue-700 mb-6"><ArrowLeft size={16} /> Back to applications</button><div className="bg-white border border-slate-200 rounded-lg"><div className="p-6 border-b flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">Application review</p><h1 className="text-2xl font-bold text-[#092f52]">{String(fields.fullName || fields.full_name || 'Candidate')}</h1><p className="text-sm text-slate-500 mt-1">{application.application_number || application.id}</p></div><span className="rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold">{application.status || 'submitted'}</span></div><div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{Object.entries(fields).map(([key, value]) => <div key={key}><p className="text-xs uppercase text-slate-400">{key.replaceAll('_', ' ')}</p><p className="mt-1 font-medium break-words">{String(value || 'Not provided')}</p></div>)}</div><div className="p-6 border-t flex flex-wrap gap-3"><button onClick={() => updateStatus('verified')} className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-semibold"><CheckCircle2 size={16} className="inline mr-2" />Confirm</button><button onClick={() => updateStatus('rejected')} className="border border-red-300 text-red-700 rounded-md px-4 py-2 text-sm font-semibold"><XCircle size={16} className="inline mr-2" />Reject</button></div>{message && <p className="px-6 pb-6 text-sm text-slate-600">{message}</p>}</div></div></main>
}
