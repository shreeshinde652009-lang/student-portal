import { redirect } from 'next/navigation'
import { PasswordResetForm } from '@/components/password-reset-form'
import { StudentAuthShell } from '@/components/student-auth-shell'
import { createClient } from '@/lib/supabase/server'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  return (
    <StudentAuthShell>
      <section className="rounded-[18px] border border-[#dedede] bg-white px-5 py-6 shadow-[0_4px_18px_rgba(0,0,0,0.04)] sm:px-8 sm:py-7">
        <div className="mx-auto max-w-[520px]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#15549a]">Account security</p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-[#343434]">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-[#626262]">Choose a new password for your CET Cell account.</p>
          <PasswordResetForm />
        </div>
      </section>
    </StudentAuthShell>
  )
}
