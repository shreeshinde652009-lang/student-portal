'use client'

import { FormEvent, useState } from 'react'
import { ArrowDown, ChevronDown, Menu, Network, Search, Volume2, X } from 'lucide-react'
import { StudentAuthShell } from '@/components/student-auth-shell'
import { createClient } from '@/lib/supabase/client'

function LoginDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }
    window.location.assign('/dashboard')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white" role="dialog" aria-modal="true" aria-labelledby="student-sign-in-title">
      <StudentAuthShell>
        <section className="relative rounded-[18px] border border-[#dedede] bg-white px-5 py-6 shadow-[0_4px_18px_rgba(0,0,0,0.04)] sm:px-6 sm:py-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student sign in"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-[#d8d8d8] bg-white text-[#15549a] shadow-sm transition hover:bg-[#f4f7fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a]"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <h1 id="student-sign-in-title" className="text-[23px] font-semibold leading-tight text-[#343434]">Sign In</h1>
          <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] md:gap-10">
            <form className="flex min-w-0 flex-col gap-4" onSubmit={handleSubmit}>
              <label htmlFor="student-email" className="flex flex-col gap-1.5 text-sm text-[#454545]">
                Registered Email ID
                <input
                  id="student-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
                />
              </label>
              <label htmlFor="student-password" className="flex flex-col gap-1.5 text-sm text-[#454545]">
                Password
                <input
                  id="student-password"
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-[10px] border border-[#d7dce4] bg-[#e8f0fc] px-4 py-3 text-sm text-[#333] outline-none transition focus-visible:border-[#4285f4] focus-visible:ring-4 focus-visible:ring-[#b4d2ff]"
                />
              </label>
              <span className="-mt-1 w-fit text-sm font-semibold text-[#343434]">Forgot Password</span>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              <button disabled={loading} className="mt-1 min-h-11 rounded-[10px] bg-[#15549a] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#10477f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a] disabled:opacity-60">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className="relative flex min-h-8 items-center justify-center md:min-h-0">
              <span aria-hidden="true" className="h-px w-full bg-[#d5d5d5] md:h-full md:w-px" />
              <span className="absolute grid size-10 place-items-center rounded-full border border-[#d7dce4] bg-white text-sm font-medium text-[#15549a] shadow-[0_2px_10px_rgba(0,0,0,0.12)]">OR</span>
            </div>
            <div className="flex flex-col justify-center text-center">
              <h2 className="text-[22px] font-semibold text-[#343434]">New user?</h2>
              <a href="/register" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#15549a] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#10477f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a]">Register</a>
            </div>
          </div>
          <nav aria-label="Student help links" className="mt-4 flex flex-col items-center gap-3 px-2 pt-2 text-center text-sm font-medium text-[#15549a]">
            <p><span className="text-[#343434]">How to Register - </span><span>User Manual</span><span className="px-2 text-[#777]">|</span><span>Tutorial Video</span></p>
            <p>How to Raise a Ticket</p>
            <p><span>How to create DigiLocker Account</span><span className="px-2 text-[#777]">|</span><span>How to create APAAR ID</span></p>
          </nav>
        </section>
        <a href="/dashboard/linux-cs-registration" className="mx-auto block max-w-[840px] rounded-[10px] border border-[#15549a] bg-white px-4 py-3 text-center text-sm font-semibold text-[#15549a] transition hover:bg-[#f4f7fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15549a]">
          Already signed in? Open Linux CS Registration
        </a>
      </StudentAuthShell>
    </div>
  )
}

const primaryNavigation = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about', dropdown: true },
  { label: 'Candidate', href: '#portal-links', dropdown: true, isNew: true },
  { label: 'CETs', href: '#portal-links', dropdown: true },
  { label: 'CAP', href: '#portal-links', dropdown: true },
  { label: 'Institute', href: '#notices', dropdown: true },
  { label: 'Downloads', href: '#notices', dropdown: true },
  { label: 'Statistics', href: '#statistics', dropdown: true },
  { label: 'Contact', href: '#help' },
]

function NewBadge() {
  return (
    <>
      <span aria-hidden="true" className="ml-1 inline-grid size-5 shrink-0 place-items-center rounded-full bg-[#e5003a] text-[6px] font-bold leading-none text-white shadow-sm">
        <span className="portal-new-label">NEW</span>
      </span>
      <span className="sr-only">New</span>
    </>
  )
}

function UtilityBar() {
  return (
    <div className="h-7 border-b border-[#b8b8b8] bg-white text-[#24345d]">
      <div className="mx-auto flex h-full max-w-[1000px] items-center justify-between gap-3 px-3 text-[10px] sm:px-3.5 sm:text-[11px]">
        <a href="#main-content" className="inline-flex shrink-0 items-center gap-1 font-medium hover:underline">
          <ArrowDown aria-hidden="true" className="size-3" />
          Skip to main content
        </a>
        <div aria-hidden="true" className="flex items-center gap-5 sm:gap-10">
          <Volume2 className="size-3.5" />
          <span className="inline-flex items-center gap-1 font-bold">A <ChevronDown className="size-3" /></span>
          <Network className="size-3.5" />
          <Search className="size-3.5" />
        </div>
      </div>
    </div>
  )
}

function PortalBrandHeader() {
  return (
    <header id="about" className="border-b border-[#ededed] bg-white">
      <div className="mx-auto flex h-[100px] max-w-[1000px] items-center justify-between gap-3 px-3 sm:h-[106px] sm:px-6 lg:h-[107px] lg:px-0">
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <img src="/ashoka-emblem-home.png" alt="Emblem of India" className="h-[72px] w-[38px] object-contain sm:h-[82px] sm:w-[48px]" />
          <span aria-hidden="true" className="h-16 w-px bg-[#bdbdbd]" />
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <img src="/cet-cell-logo-home.png" alt="State Common Entrance Test Cell logo" className="size-[48px] shrink-0 object-contain sm:size-[76px]" />
          <div className="min-w-0 text-[#20366b]">
            <h1 className="whitespace-nowrap text-[11px] font-bold tracking-[0.02em] sm:text-base md:text-xl">GOVERNMENT OF MAHARASHTRA</h1>
            <p className="mt-1 whitespace-nowrap text-[10px] sm:text-sm md:text-base">State Common Entrance Test Cell</p>
          </div>
        </div>
        <img src="/maharashtra-seal-home.png" alt="Government of Maharashtra seal" className="size-[48px] shrink-0 object-contain sm:size-[76px]" />
      </div>
    </header>
  )
}

function SiteNavigation({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <nav id="navigation" aria-label="Main navigation" className="bg-[#20366b] text-white">
      <div className="mx-auto max-w-[1000px] px-3 sm:px-1.5">
        <div className="flex h-12 items-center justify-between lg:hidden">
          <button type="button" onClick={onMenuToggle} aria-expanded={menuOpen} aria-controls="primary-navigation" className="inline-flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {menuOpen ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
            Menu
          </button>
          <a href="#help" className="rounded-sm border border-white/40 px-3 py-2 text-xs font-semibold">Ask Pragati</a>
        </div>
        <div id="primary-navigation" className={`${menuOpen ? 'flex' : 'hidden'} flex-col gap-1 pb-3 lg:flex lg:pb-0`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/15 py-2 text-[11px] sm:gap-x-4 lg:min-h-[62px] lg:border-0 lg:py-3 lg:text-xs">
            {primaryNavigation.map(({ label, href, dropdown, isNew }) => (
              <a key={label} href={href} className="inline-flex items-center gap-1 whitespace-nowrap py-1 hover:underline">
                {label}
                {isNew && <NewBadge />}
                {dropdown && <ChevronDown aria-hidden="true" className="size-3" />}
              </a>
            ))}
            <a href="#help" className="hidden items-center gap-2 rounded-sm border border-white/40 px-3 py-2 lg:ml-auto lg:inline-flex">
              Ask Pragati <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-[#efd14f] text-[10px] font-bold text-[#20366b]">P</span>
            </a>
          </div>
          <div className="hidden items-center gap-4 border-t border-white/15 py-3 text-xs lg:flex">
            <a href="#help" className="inline-flex items-center hover:underline">Job For Retired Officer <NewBadge /></a>
            <a href="#statistics" className="inline-flex items-center gap-1 hover:underline">Institute Level Option Form <ChevronDown aria-hidden="true" className="size-3" /></a>
            <a href="#help" className="hover:underline">RTI</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

function AnnouncementTicker() {
  const announcement = 'CET Cell Portal 2026 is now open. Keep your documents ready before registration.'

  return (
    <section id="notices" aria-label="Announcements" className="h-[50px] border-b border-[#e6e6e6] bg-white sm:h-[54px]">
      <div className="mx-auto flex h-full max-w-[1000px] items-center overflow-hidden px-1.5">
        <span className="z-10 flex h-full shrink-0 items-center bg-[#e7c956] px-3 text-xs font-semibold text-white sm:px-3.5 sm:text-sm">Announcement</span>
        <div className="min-w-0 flex-1 overflow-hidden bg-[#f3f3f3] py-3">
          <div className="announcement-track flex min-w-max items-center gap-12 whitespace-nowrap px-4 text-xs font-semibold text-[#3764a8] sm:text-sm">
            <span>{announcement}</span>
            <span aria-hidden="true">{announcement}</span>
          </div>
        </div>
        <a href="#notices" className="hidden h-full shrink-0 items-center px-4 text-[15px] font-semibold text-[#1d3470] hover:underline lg:flex">Instruction to Candidates</a>
      </div>
    </section>
  )
}

const heroNewBadges = [
  { label: 'Admission Portal', left: '81.3%', top: '20.4%' },
  { label: 'Foreign Candidate Registration', left: '87.5%', top: '36.7%' },
  { label: 'CET Examination Portal', left: '89.8%', top: '55.6%' },
  { label: 'Student Help Centre', left: '90.2%', top: '84.8%' },
]

function PortalHero({ onLogin }: { onLogin: () => void }) {
  return (
    <section id="home" aria-label="State CET Cell services" className="mx-auto max-w-[1280px]">
      <div id="portal-links" className="relative">
        <img src="/cet-home-hero.png" alt="MH-CET promotion with two students and links to admission, foreign candidate, examination, and support portals" className="block h-auto w-full" />
        <div className="absolute inset-y-0 right-0 z-20 grid w-1/4 grid-rows-5">
          <button type="button" onClick={onLogin} aria-label="Open Admission Portal for A.Y. 2025-26" className="bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white" />
          <button type="button" onClick={onLogin} aria-label="Open Foreign Candidate Registration for A.Y. 2025-26" className="bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white" />
          <button type="button" onClick={onLogin} aria-label="Open CET Examination Portal for A.Y. 2025-26" className="bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white" />
          <a href="#help" aria-label="Candidate Help and Instructions" className="focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white" />
          <a href="#help" aria-label="Student Help Centre in Marathi" className="focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
          {heroNewBadges.map(({ label, left, top }) => (
            <span key={label} className="absolute grid aspect-square w-[1.6%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e5003a] text-[clamp(4px,0.48vw,7px)] font-bold leading-none text-white shadow-sm" style={{ left, top }}>
              <span className="portal-new-label">NEW</span>
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-[#e5e5e5] bg-white p-3 lg:hidden">
        <button type="button" onClick={onLogin} className="rounded border border-[#d6dce6] px-3 py-2 text-left text-xs font-semibold text-[#20366b]">Admission Portal</button>
        <button type="button" onClick={onLogin} className="rounded border border-[#d6dce6] px-3 py-2 text-left text-xs font-semibold text-[#20366b]">Foreign Candidate</button>
        <button type="button" onClick={onLogin} className="rounded border border-[#d6dce6] px-3 py-2 text-left text-xs font-semibold text-[#20366b]">CET Examination</button>
        <a href="#help" className="rounded border border-[#d6dce6] px-3 py-2 text-xs font-semibold text-[#20366b]">Help &amp; Instructions</a>
      </div>
    </section>
  )
}

function StatisticsStrip() {
  const values = ['5', '18', '71', '3,925+']

  return (
    <section id="statistics" aria-label="Portal statistics" className="mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4">
      {values.map((value, index) => (
        <div key={value} className={`flex min-h-[54px] items-center justify-center text-2xl font-bold text-white sm:min-h-[58px] sm:text-3xl ${index % 2 === 0 ? 'bg-[#e7c956]' : 'bg-[#20366b]'}`}>
          {value}
        </div>
      ))}
    </section>
  )
}

export function CetPortal() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans text-[#2b2b2b]">
      <UtilityBar />
      <PortalBrandHeader />
      <SiteNavigation menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
      <AnnouncementTicker />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <PortalHero onLogin={() => setLoginOpen(true)} />
        <StatisticsStrip />
      </main>
      <footer id="help" className="border-t border-[#e9e9e9] bg-white px-4 py-8 text-center sm:py-10">
        <p className="font-semibold text-[#20366b]">Office Address</p>
        <p className="mt-2 text-sm">8th Floor, New Excelsior Building, A. K. Nayak Marg, Fort, Mumbai 400001</p>
        <p className="mt-5 text-xs text-[#666]">Copyright © State CET Cell, Maharashtra State, Mumbai. All rights reserved.</p>
      </footer>
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} />}
    </div>
  )
}
