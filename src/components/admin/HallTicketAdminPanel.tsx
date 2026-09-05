'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type HallTicket = {
  id?: string
  candidate_name: string
  candidate_name_local: string
  roll_number: string
  exam_name: string
  exam_date: string
  exam_time: string
  reporting_time: string
  gate_closing_time: string
  question_paper_language: string
  gender: string
  application_number: string
  exam_center_name: string
  exam_center_address: string
  venue_code: string
  photo_path: string
  signature_path: string
  qr_value: string
  instructions: string[]
  status: 'draft' | 'published'
}

const emptyTicket: HallTicket = {
  candidate_name: '', candidate_name_local: '', roll_number: '', exam_name: 'CET Examination', exam_date: '', exam_time: '', reporting_time: '', gate_closing_time: '', question_paper_language: 'English', gender: '', application_number: '', exam_center_name: '', exam_center_address: '', venue_code: '', photo_path: '', signature_path: '', qr_value: '', instructions: [], status: 'draft',
}

export function HallTicketAdminPanel({ applicationId, applicationNumber, candidateName }: { applicationId: string; applicationNumber?: string; candidateName?: string }) {
  const [ticket, setTicket] = useState<HallTicket>({ ...emptyTicket, application_number: applicationNumber || '', candidate_name: candidateName || '' })
  const [instruction, setInstruction] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await createClient().from('hall_ticket_details').select('*').eq('application_id', applicationId).maybeSingle()
      if (error) setMessage(`Hall Ticket unavailable: ${error.message}`)
      if (data) setTicket({ ...emptyTicket, ...data, instructions: data.instructions || [] })
      setLoading(false)
    }
    void load()
  }, [applicationId])

  const update = (key: keyof HallTicket, value: string) => setTicket((current) => ({ ...current, [key]: value }))
  const save = async (status: HallTicket['status']) => {
    setSaving(true); setMessage('')
    const { data: { user } } = await createClient().auth.getUser()
    const payload = { ...ticket, application_id: applicationId, status, updated_at: new Date().toISOString(), updated_by: user?.id }
    const { error } = await createClient().from('hall_ticket_details').upsert(payload, { onConflict: 'application_id' })
    setSaving(false)
    setMessage(error ? `Unable to save Hall Ticket: ${error.message}` : `Hall Ticket ${status === 'published' ? 'published' : 'saved as draft'}.`)
    if (!error) setTicket((current) => ({ ...current, status }))
  }
  const remove = async () => {
    if (!ticket.id || !window.confirm('Delete this Hall Ticket record?')) return
    const { error } = await createClient().from('hall_ticket_details').delete().eq('id', ticket.id)
    if (error) setMessage(`Unable to delete Hall Ticket: ${error.message}`)
    else { setTicket({ ...emptyTicket, application_number: applicationNumber || '', candidate_name: candidateName || '' }); setMessage('Hall Ticket record deleted.') }
  }
  const field = (key: keyof HallTicket, label: string, type = 'text') => <label className="grid gap-1 text-xs font-semibold text-slate-600"><span>{label}</span><input type={type} value={String(ticket[key] ?? '')} onChange={(event) => update(key, event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900" /></label>

  return <section className="border-t p-6" aria-labelledby="hall-ticket-heading"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-slate-400">Document management</p><h2 id="hall-ticket-heading" className="text-lg font-semibold text-[#092f52]">Hall Ticket</h2><p className="mt-1 text-sm text-slate-500">Draft records remain private. Publish only after all exam and venue details are verified.</p></div><span className={`px-3 py-1 text-xs font-semibold uppercase ${ticket.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{ticket.status}</span></div>{loading ? <p className="mt-5 text-sm text-slate-500">Loading Hall Ticket details...</p> : <><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{field('candidate_name', 'Candidate name')}{field('candidate_name_local', 'Candidate name (local)')}{field('roll_number', 'Roll number')}{field('exam_name', 'Exam name')}{field('exam_date', 'Exam date', 'date')}{field('exam_time', 'Exam time')}{field('reporting_time', 'Reporting time')}{field('gate_closing_time', 'Gate closing time')}{field('question_paper_language', 'Question paper language')}{field('gender', 'Gender')}{field('application_number', 'Application number')}{field('venue_code', 'Venue code')}{field('exam_center_name', 'Exam centre')}{field('photo_path', 'Photo path / URL')}{field('signature_path', 'Signature path / URL')}{field('qr_value', 'QR value')}</div><label className="mt-4 grid gap-1 text-xs font-semibold text-slate-600"><span>Exam centre address</span><textarea value={ticket.exam_center_address} onChange={(event) => update('exam_center_address', event.target.value)} className="min-h-20 border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900" /></label><div className="mt-4"><span className="text-xs font-semibold text-slate-600">Instructions</span><div className="mt-2 flex gap-2"><input value={instruction} onChange={(event) => setInstruction(event.target.value)} className="flex-1 border border-slate-300 px-3 py-2 text-sm" placeholder="Add an instruction" /><button type="button" onClick={() => { if (instruction.trim()) { setTicket((current) => ({ ...current, instructions: [...current.instructions, instruction.trim()] })); setInstruction('') } }} className="border border-slate-300 px-3 py-2 text-sm font-semibold">Add</button></div><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{ticket.instructions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={() => void save('draft')} className="border border-slate-300 px-4 py-2 text-sm font-semibold">Save draft</button><button type="button" disabled={saving} onClick={() => void save('published')} className="bg-[#092f52] px-4 py-2 text-sm font-semibold text-white">Publish Hall Ticket</button>{ticket.id && <button type="button" onClick={() => void remove()} className="border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">Delete</button>}</div>{message && <p className="mt-3 text-sm text-slate-600" role="status">{message}</p>}</>}</section>
}
