import type { ReactNode } from 'react'

export function StudentAuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="student-auth-page min-h-screen w-full px-4 pb-10 pt-2 text-[#343434] sm:px-6">
      <header aria-label="Government of Maharashtra State CET Cell" className="mx-auto flex h-[88px] w-full max-w-[980px] items-center gap-2 sm:h-[104px] sm:gap-4">
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <img src="/ashoka-emblem-home.png" alt="Emblem of India" className="h-[58px] w-[32px] object-contain sm:h-[78px] sm:w-[46px]" />
          <span aria-hidden="true" className="h-14 w-px bg-[#c8c8c8] sm:h-16" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-6">
          <img src="/cet-cell-logo-home.png" alt="State Common Entrance Test Cell logo" className="size-[44px] shrink-0 object-contain sm:size-[70px]" />
          <div className="min-w-0 text-[#15549a]">
            <p className="text-[10px] font-bold leading-tight tracking-[0.015em] sm:text-[21px]">GOVERNMENT OF MAHARASHTRA</p>
            <p className="mt-1 text-[9px] font-semibold leading-tight sm:text-[15px]">State Common Entrance Test Cell</p>
          </div>
        </div>
        <img src="/maharashtra-seal-home.png" alt="Government of Maharashtra seal" className="ml-1 size-[44px] shrink-0 object-contain sm:ml-8 sm:size-[70px]" />
      </header>
      <p className="mt-7 text-center text-[15px] font-medium text-[#15549a] sm:mt-8">Academic Year 2026-27</p>
      <div className="mx-auto mt-9 w-full max-w-[840px] sm:mt-12">{children}</div>
    </main>
  )
}
