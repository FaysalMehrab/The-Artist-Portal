'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, modelProfile, agencyProfile, signOut, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const displayName = role === 'model'
    ? modelProfile?.name || 'My Profile'
    : agencyProfile?.agency_name || 'Dashboard'

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      'flex items-center justify-between px-6 md:px-14 py-4',
      scrolled
        ? 'bg-black/95 backdrop-blur-xl border-b border-white/10'
        : 'bg-black/70 backdrop-blur-md border-b border-[#c9a84c]/10'
    )}>
      <Link href="/" className="font-playfair text-2xl font-bold tracking-tight">
        The Artist <span className="text-[#c9a84c]">Portal</span>
        <span className="text-xs font-normal text-white/30 ml-2 hidden md:inline">Bangladesh</span>
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-8 list-none">
        {[
          { href: '/', label: 'Home' },
          { href: '/models', label: 'Find Models' },
          { href: '/jobs', label: 'Browse Jobs' },
        ].map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={cn(
              'text-sm font-medium transition-colors',
              pathname === href ? 'text-[#c9a84c]' : 'text-white/60 hover:text-[#c9a84c]'
            )}>{label}</Link>
          </li>
        ))}
      </ul>

      {/* Auth section */}
      <div className="hidden md:flex gap-3 items-center">
        {loading ? (
          <div className="w-20 h-8 bg-white/5 rounded-lg animate-pulse" />
        ) : user ? (
          <>
            <Link
              href={role === 'agency' ? '/dashboard/agency' : '/dashboard/model'}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors max-w-[160px] truncate">
              👤 {displayName}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium border border-white/15 text-white/60 px-4 py-2 rounded-lg hover:border-red-500/40 hover:text-red-400 transition-all">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login"
              className="text-sm font-medium text-white border border-white/20 px-5 py-2 rounded-lg hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
              Sign In
            </Link>
            <Link href="/register"
              className="text-sm font-bold bg-[#c9a84c] text-black px-5 py-2 rounded-lg hover:bg-[#e8c97a] transition-all hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]">
              Join Free
            </Link>
          </>
        )}
      </div>

      {/* Mobile */}
      <button className="md:hidden text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/98 border-b border-white/10 md:hidden">
          <div className="flex flex-col p-6 gap-4">
            {[{ href: '/', label: 'Home' }, { href: '/models', label: 'Find Models' }, { href: '/jobs', label: 'Browse Jobs' }].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2 text-white/70">{label}</Link>
            ))}
            {user ? (
              <>
                <Link href={role === 'agency' ? '/dashboard/agency' : '/dashboard/model'}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#c9a84c] py-2">Dashboard</Link>
                <button onClick={handleSignOut} className="text-sm text-red-400 py-2 text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-white/70 py-2">Sign In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="bg-[#c9a84c] text-black font-bold px-5 py-3 rounded-lg text-center text-sm">Join Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
