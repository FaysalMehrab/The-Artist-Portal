'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    // Determine role from profile tables
    const userId = data.user.id
    const { data: model } = await supabase.from('models').select('id').eq('id', userId).maybeSingle()
    if (model) { router.push('/dashboard/model'); return }

    const { data: agency } = await supabase.from('agency_profiles').select('id').eq('id', userId).maybeSingle()
    if (agency) { router.push('/dashboard/agency'); return }

    // Profile not set up yet
    router.push('/')
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c9a84c]/50 transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-3xl font-bold">
            The Artist <span className="text-[#c9a84c]">Portal</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm">Sign in to your The Artist Portal account</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-white/35 mb-2">Email Address</label>
              <input className={inputCls} type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-white/35 mb-2">Password</label>
              <input className={inputCls} type="password" placeholder="Your password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#c9a84c] text-black font-bold py-4 rounded-xl hover:bg-[#e8c97a] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-white/35 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#c9a84c] hover:underline font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
