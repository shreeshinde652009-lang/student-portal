'use client'

import { Fragment, FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type FormState = {
  fullName: string
  dateOfBirth: string
  gender: string
  mobile: string
  email: string
  address: string
  city: string
  district: string
  state: string
  pinCode: string
  schoolName: string
  board: string
  passingYear: string
  percentage: string
  examYear: string
  examCenter: string
  photo: File | null
  signature: File | null
  certificate: File | null
  declaration: boolean
}

const initialForm: FormState = {
  fullName: '', dateOfBirth: '', gender: '', mobile: '', email: '', address: '', city: '', district: '', state: 'Maharashtra', pinCode: '', schoolName: '', board: '', passingYear: '', percentage: '', examYear: '2026', examCenter: '', photo: null, signature: null, certificate: null, declaration: false,
}

const steps = ['Personal Details', 'Contact & Address', 'Educational Details', 'Exam Details', 'Documents', 'Declaration & Submit']
const requiredByStep: Record<number, (keyof FormState)[]> = {
  0: ['fullName', 'dateOfBirth', 'gender'], 1: ['mobile', 'email', 'address', 'city', 'district', 'state', 'pinCode'], 2: ['schoolName', 'board', 'passingYear', 'percentage'], 3: ['examYear', 'examCenter'], 4: ['photo', 'signature', 'certificate'], 5: ['declaration'],
}

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <label className="flex flex-col gap-2 text-sm font-semibold text-primary">{label}{required && <span className="text-accent"> *</span>}{children}</label>
}

function Input({ value, onChange, type = 'text', placeholder = '' }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <input required value={value} type={type} placeholder={placeholder} onChange={event => onChange(event.target.value)} className="rounded-md border border-input bg-background px-3 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-ring" />
}

function FileField({ label, file, onChange, accept }: { label: string; file: File | null; onChange: (file: File | null) => void; accept: string }) {
  return <div className="flex flex-col gap-2"><span className="text-sm font-semibold text-primary">{label} <span className="text-accent">*</span></span><label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-primary/40 bg-secondary/40 px-4 py-4 text-sm text-muted-foreground hover:bg-secondary"><FileUp className="text-primary" /> <span>{file ? `${file.name} (${Math.ceil(file.size / 1024)} KB)` : 'Choose file'}</span><input required={!file} type="file" accept={accept} className="sr-only" onChange={event => onChange(event.target.files?.[0] ?? null)} /></label><p className="text-xs text-muted-foreground">JPG, PNG or PDF. Maximum size 5 MB.</p></div>
}

export function LinuxCsRegistration() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState<{ number: string; submittedAt: string } | null>(null)
  const [isReregistration, setIsReregistration] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('')

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(current => ({ ...current, [key]: value }))
  const stepProgress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step])

  useEffect(() => {
    const editMode = new URLSearchParams(window.location.search).get('mode') === 'edit'
    setIsReregistration(editMode)
    setIsEditing(!editMode)
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return window.location.replace('/')
      const supabase = createClient()
      const { data: application } = await supabase.from('applications').select('application_number, submitted_at, personal_data, academic_data').eq('user_id', data.user.id).eq('course_name', 'Linux CS').maybeSingle()
      if (application && editMode) {
        const personal = (application.personal_data ?? {}) as Record<string, string>
        const academic = (application.academic_data ?? {}) as Record<string, string>
        setForm(current => ({ ...current, ...personal, ...academic, email: data.user.email ?? current.email, declaration: true }))
        setSubmitted({ number: application.application_number, submittedAt: application.submitted_at ?? new Date().toISOString() })
        const { data: docs } = await supabase.from('documents').select('document_type, storage_path').eq('application_id', application.id)
        const photoPath = docs?.find(document => document.document_type === 'photo')?.storage_path
        if (photoPath) {
          const { data: signed } = await supabase.storage.from('documents').createSignedUrl(photoPath, 3600)
          if (signed?.signedUrl) setUploadedPhotoUrl(signed.signedUrl)
        }
      } else setForm(current => ({ ...current, email: data.user.email ?? current.email }))
    })
  }, [])

  function validateStep() {
    const missing = requiredByStep[step].find(key => !form[key])
    if (missing) return 'Please complete all required fields before continuing.'
    if (step === 1 && !/^[6-9]\d{9}$/.test(form.mobile)) return 'Enter a valid 10-digit Indian mobile number.'
    if (step === 1 && !/^\d{6}$/.test(form.pinCode)) return 'Enter a valid 6-digit PIN code.'
    if (step === 4 && [form.photo, form.signature, form.certificate].some(file => file && file.size > 5 * 1024 * 1024)) return 'Each document must be 5 MB or smaller.'
    return ''
  }

  function next() {
    const validation = validateStep()
    if (validation) { setError(validation); return }
    setError(''); setStep(current => Math.min(current + 1, steps.length - 1))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const validation = validateStep()
    if (validation) { setError(validation); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { window.location.replace('/'); return }
    const { data: existing } = await supabase.from('applications').select('id, application_number, status, submitted_at').eq('user_id', auth.user.id).eq('course_name', 'Linux CS').maybeSingle()
    if (existing?.application_number) { setSubmitted({ number: existing.application_number, submittedAt: existing.submitted_at ?? new Date().toISOString() }); setSaving(false); return }
    const applicationNumber = `LCS2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const { data: application, error: insertError } = await supabase.from('applications').insert({ user_id: auth.user.id, application_number: applicationNumber, exam_year: Number(form.examYear), course_name: 'Linux CS', exam_group: 'Linux CS', personal_data: { fullName: form.fullName, dateOfBirth: form.dateOfBirth, gender: form.gender, mobile: form.mobile, email: form.email, address: form.address, city: form.city, district: form.district, state: form.state, pinCode: form.pinCode }, academic_data: { schoolName: form.schoolName, board: form.board, passingYear: form.passingYear, percentage: form.percentage, examCenter: form.examCenter, documents: {} }, status: 'submitted', submitted_at: new Date().toISOString() }).select('id, application_number, submitted_at').single()
    if (insertError || !application) { setError('We could not submit your application. Please try again.'); setSaving(false); return }
    const files = [{ file: form.photo, type: 'photo' }, { file: form.signature, type: 'signature' }, { file: form.certificate, type: 'certificate' }]
    for (const item of files) {
      if (!item.file) continue
      const path = `${auth.user.id}/${applicationNumber}/${item.type}-${item.file.name}`
      const upload = await supabase.storage.from('documents').upload(path, item.file, { upsert: false })
      if (upload.error) { setError('Application saved, but a document upload failed. Contact the help desk with your application number.'); setSaving(false); return }
      await supabase.from('documents').insert({ application_id: application.id, user_id: auth.user.id, document_type: item.type, file_name: item.file.name, mime_type: item.file.type, file_size: item.file.size, storage_path: path })
      if (item.type === 'photo') {
        const { data: signed } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
        if (signed?.signedUrl) setUploadedPhotoUrl(signed.signedUrl)
      }
    }
    setSubmitted({ number: application.application_number, submittedAt: application.submitted_at ?? new Date().toISOString() }); setSaving(false)
  }

  if (submitted && isReregistration && !isEditing) return <ApplicationPreview form={form} application={submitted} photoUrl={uploadedPhotoUrl} onEdit={() => setIsEditing(true)} />
  if (submitted && !isReregistration) return <Confirmation number={submitted.number} submittedAt={submitted.submittedAt} name={form.fullName} />

  return <main className="min-h-screen bg-secondary/25 px-4 py-6 text-foreground sm:px-6 lg:px-10"><div className="mx-auto max-w-5xl"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-5 py-4"><a href="/dashboard" className="inline-flex items-center gap-2 font-semibold text-primary"><ArrowLeft /> Back to Dashboard</a><span className="font-semibold text-primary">Academic Year 2026-27</span></header><section className="mt-6 rounded-none border-2 border-foreground/70 bg-card p-3 shadow-sm sm:p-6 print:border-2 print:shadow-none"><div className="flex flex-col items-center gap-6 border-b border-border pb-6"><div className="flex items-center justify-center gap-4"><img src="/ashoka-emblem.png" alt="Ashoka Emblem" className="h-16 w-16" /><div className="flex flex-col items-center"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Government of Maharashtra</p><p className="text-lg font-bold text-primary">CET Cell</p><p className="text-xs text-muted-foreground">Common Entrance Test</p></div><img src="/cet-logo.png" alt="CET Logo" className="h-16 w-16" /></div></div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="border border-foreground/70 bg-secondary px-3 py-2 text-sm font-bold uppercase tracking-widest text-foreground">Online Registration For Linux CS Exam 2026 — Application Form</p><h1 className="mt-2 text-3xl font-bold text-primary">Linux CS Exam Registration</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Complete each section carefully. Your application will be verified by the examination cell after submission.</p></div><span className="rounded-md bg-secondary px-3 py-2 text-sm font-bold text-primary">Course locked: Linux CS</span></div>{isReregistration && submitted && <div className="mt-5 flex items-center justify-between border-2 border-foreground/60 bg-secondary px-4 py-3"><div><p className="font-bold text-primary">Submitted Application Form</p><p className="text-sm text-muted-foreground">Application No. {submitted.number} · Read-only view</p></div><button type="button" onClick={() => setIsEditing(true)} className="rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground">Edit Form</button></div>}<div className={`mt-8 ${isReregistration && !isEditing ? 'pointer-events-none select-none opacity-90' : ''}`}><div className="flex items-center justify-between text-sm font-semibold text-primary"><span>Step {step + 1} of {steps.length}</span><span>{stepProgress}% complete</span></div><div className="mt-3 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${stepProgress}%` }} /></div><div className="mt-4 hidden justify-between gap-2 text-xs text-muted-foreground md:flex">{steps.map((item, index) => <span key={item} className={index <= step ? 'font-bold text-primary' : ''}>{item}</span>)}</div></div>{error && <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}<form onSubmit={submit} className="mt-8">{step === 0 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Full Name"><Input value={form.fullName} onChange={value => update('fullName', value)} placeholder="As per certificate" /></Field><Field label="Date of Birth"><Input value={form.dateOfBirth} onChange={value => update('dateOfBirth', value)} type="date" /></Field><Field label="Gender"><select required value={form.gender} onChange={event => update('gender', event.target.value)} className="rounded-md border border-input bg-background px-3 py-3"><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></Field></div>}{step === 1 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Mobile Number"><Input value={form.mobile} onChange={value => update('mobile', value)} type="tel" placeholder="10-digit mobile" /></Field><Field label="Email Address"><Input value={form.email} onChange={value => update('email', value)} type="email" /></Field><div className="sm:col-span-2"><Field label="Address"><textarea required value={form.address} onChange={event => update('address', event.target.value)} className="min-h-24 rounded-md border border-input bg-background px-3 py-3" /></Field></div><Field label="City"><Input value={form.city} onChange={value => update('city', value)} /></Field><Field label="District"><Input value={form.district} onChange={value => update('district', value)} /></Field><Field label="State"><Input value={form.state} onChange={value => update('state', value)} /></Field><Field label="PIN Code"><Input value={form.pinCode} onChange={value => update('pinCode', value)} type="tel" /></Field></div>}{step === 2 && <div className="grid gap-5 sm:grid-cols-2"><Field label="School / College Name"><Input value={form.schoolName} onChange={value => update('schoolName', value)} /></Field><Field label="Board / University"><Input value={form.board} onChange={value => update('board', value)} /></Field><Field label="Passing Year"><Input value={form.passingYear} onChange={value => update('passingYear', value)} type="number" /></Field><Field label="Percentage / CGPA"><Input value={form.percentage} onChange={value => update('percentage', value)} /></Field></div>}{step === 3 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Exam Year"><Input value={form.examYear} onChange={value => update('examYear', value)} type="number" /></Field><Field label="Preferred Exam Center"><Input value={form.examCenter} onChange={value => update('examCenter', value)} placeholder="City / centre preference" /></Field></div>}{step === 4 && <div className="grid gap-5 sm:grid-cols-2"><FileField label="Recent Photograph" file={form.photo} onChange={file => update('photo', file)} accept="image/jpeg,image/png" /><FileField label="Signature" file={form.signature} onChange={file => update('signature', file)} accept="image/jpeg,image/png" /><div className="sm:col-span-2"><FileField label="Marksheet / Certificate" file={form.certificate} onChange={file => update('certificate', file)} accept="image/jpeg,image/png,application/pdf" /></div></div>}{step === 5 && <div className="rounded-lg border border-border bg-secondary/35 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 shrink-0 text-primary" /><p className="text-sm leading-6 text-muted-foreground">I declare that the information provided is true and correct. I understand that incomplete, inaccurate, or misleading information may lead to rejection of my application.</p></div><label className="mt-6 flex items-center gap-3 font-semibold text-primary"><input type="checkbox" checked={form.declaration} onChange={event => update('declaration', event.target.checked)} className="size-5 accent-primary" /> I accept the declaration.</label></div>}<div className="mt-8 flex justify-between gap-3 border-t border-border pt-5"><button type="button" disabled={step === 0} onClick={() => { setError(''); setStep(current => Math.max(0, current - 1)) }} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 font-semibold text-primary disabled:opacity-40"><ArrowLeft /> Back</button>{step < steps.length - 1 ? <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Next <ArrowRight /></button> : <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60">{saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {saving ? 'Submitting...' : 'Submit Application'}</button>}</div></form></section></div></main>
}

function ApplicationPreview({ form, application, photoUrl, onEdit }: { form: FormState; application: { number: string; submittedAt: string }; photoUrl: string; onEdit: () => void }) {
  const rows = [['Candidate\'s Full Name', form.fullName], ['Date of Birth', form.dateOfBirth], ['Gender', form.gender], ['Mobile Number', form.mobile], ['Email ID', form.email], ['Address', `${form.address}, ${form.city}, ${form.district}, ${form.state} - ${form.pinCode}`], ['School / College', form.schoolName], ['Board', form.board], ['Passing Year', form.passingYear], ['Percentage', form.percentage], ['Exam Centre', form.examCenter]]
  return <main className="min-h-screen bg-secondary/25 px-4 py-6 text-foreground sm:px-8"><section className="mx-auto max-w-4xl border-2 border-foreground bg-card p-3 shadow-sm sm:p-6"><div className="border border-foreground text-center"><div className="flex items-center justify-center gap-4 border-b border-foreground p-4"><img src="/ashoka-emblem.png" alt="Ashoka Emblem" className="size-14 object-contain" /><div><p className="text-xs font-bold uppercase">Government of Maharashtra</p><h1 className="text-xl font-black">STATE COMMON ENTRANCE TEST CELL</h1><p className="text-sm font-bold">MAHARASHTRA STATE</p></div><img src="/cet-logo.png" alt="CET Cell logo" className="size-14 object-contain" /></div><p className="bg-secondary p-2 text-lg font-bold">Linux CS Exam 2026 — Application Form</p></div><div className="mt-4 flex flex-wrap justify-between gap-3 border border-foreground bg-secondary px-3 py-2 text-sm font-bold"><span>Application No.: {application.number}</span><span>Version No.: 1</span></div>{photoUrl && <div className="mt-4 flex justify-end"><img src={photoUrl} alt="Uploaded candidate photograph" className="h-32 w-24 border-2 border-foreground object-cover" /></div>}<h2 className="mt-4 bg-secondary px-3 py-2 text-sm font-bold">Personal, Contact &amp; Qualification Details</h2><div className="grid border-l border-t border-foreground sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[42%_58%] border-b border-r border-foreground text-sm"><span className="bg-secondary/60 px-2 py-2 font-semibold">{label}</span><span className="px-2 py-2">{value || '—'}</span></div>)}</div><h2 className="mt-4 bg-secondary px-3 py-2 text-sm font-bold">Documents Uploaded</h2><div className="grid grid-cols-2 border-l border-t border-foreground text-sm"><span className="border-b border-r border-foreground bg-secondary/60 px-3 py-2 font-semibold">Document</span><span className="border-b border-r border-foreground bg-secondary/60 px-3 py-2 font-semibold">Status</span>{[['Photograph', form.photo], ['Signature', form.signature], ['Certificate', form.certificate]].map(([label, file]) => <Fragment key={label}><span className="border-b border-r border-foreground px-3 py-2">{label}</span><span className="border-b border-r border-foreground px-3 py-2">{file ? 'Uploaded' : 'Not available'}</span></Fragment>)}</div><div className="mt-4 border border-foreground p-3 text-sm"><p className="font-bold">Declaration of the Candidate</p><p className="mt-2">I hereby confirm that the information submitted in this application form is true and correct.</p></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Submitted on: {new Date(application.submittedAt).toLocaleString('en-IN')}</p><button type="button" onClick={onEdit} className="rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Edit Form</button></div></section></main>
}

function Confirmation({ number, submittedAt, name }: { number: string; submittedAt: string; name: string }) {
  return <main className="grid min-h-screen place-items-center bg-secondary/25 px-5 py-10"><section className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto text-primary" size={60} /><p className="mt-5 text-sm font-bold uppercase tracking-widest text-accent">Application submitted</p><h1 className="mt-2 text-3xl font-bold text-primary">Thank you, {name}</h1><p className="mt-3 leading-6 text-muted-foreground">Your Linux CS examination application has been submitted successfully and will be verified by the administrator.</p><div className="mt-7 grid gap-4 rounded-lg bg-secondary p-5 text-left sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Application number</p><p className="mt-1 font-bold text-primary">{number}</p></div><div><p className="text-xs text-muted-foreground">Course</p><p className="mt-1 font-bold text-primary">Linux CS</p></div><div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1 font-bold text-primary">SUBMITTED</p></div><div className="sm:col-span-3"><p className="text-xs text-muted-foreground">Submitted on</p><p className="mt-1 font-semibold">{new Date(submittedAt).toLocaleString('en-IN')}</p></div></div><a href="/dashboard" className="mt-7 inline-flex rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Return to Dashboard</a></section></main>
}

export { initialForm }
