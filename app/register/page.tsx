'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BD_DISTRICTS = [
  'Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barishal',
  'Comilla','Gazipur','Narayanganj','Mymensingh','Rangpur',
  'Jessore','Bogra','Dinajpur','Tangail','Faridpur'
]
const SPECIALIZATIONS = ['Commercial','Runway','Editorial','Fitness','Print','High Fashion','Catalog','Bridal']

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'model' | 'agency'>('model')
  const [step, setStep] = useState<'account' | 'profile'>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [account, setAccount] = useState({ email: '', password: '', confirmPassword: '' })
  const [modelForm, setModelForm] = useState({
    name: '', age: '', city: 'Dhaka', height: '', specialization: '', phone: '', instagram: '',
  })
  const [agencyForm, setAgencyForm] = useState({
    agencyName: '', contactPerson: '', city: 'Dhaka', website: '',
  })

  const setAcc = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAccount(f => ({ ...f, [k]: e.target.value }))
  const setM = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setModelForm(f => ({ ...f, [k]: e.target.value }))
  const setA = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAgencyForm(f => ({ ...f, [k]: e.target.value }))

  const handleAccountStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (account.password !== account.confirmPassword) { setError('Passwords do not match.'); return }
    if (account.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!account.email.includes('@')) { setError('Please enter a valid email.'); return }
    setStep('profile')
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        // Skip email redirect — we handle everything here
        emailRedirectTo: undefined,
      }
    })

    if (authError) {
      // Common errors with friendly messages
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else if (authError.message.includes('invalid')) {
        setError('Invalid email or password format.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Signup failed. Please try again.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // Step 2: If session exists, insert profile directly
    // If not (email confirmation required), sign in first
    let sessionReady = !!authData.session

    if (!sessionReady) {
      // Try signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      })
      if (signInError) {
        // Email confirmation is ON — show a clear message
        if (signInError.message.toLowerCase().includes('email') || signInError.status === 400) {
          setError(
            'Almost there! Please check your email inbox and click the confirmation link Supabase sent you, then come back and sign in.\n\n' +
            'TIP for developers: Go to Supabase → Authentication → Providers → Email → turn OFF "Confirm email" to skip this step.'
          )
        } else {
          setError('Sign-in failed: ' + signInError.message)
        }
        setLoading(false)
        return
      }
      sessionReady = true
    }

    // Step 3: Insert profile row
    if (role === 'model') {
      const { error: profileError } = await supabase.from('models').insert([{
        id: userId,
        name: modelForm.name,
        age: parseInt(modelForm.age) || null,
        city: modelForm.city,
        height: modelForm.height || null,
        specialization: modelForm.specialization || null,
        phone: modelForm.phone || null,
        instagram: modelForm.instagram || null,
        bio: '',
        photo_url: '',
        tags: modelForm.specialization ? [modelForm.specialization] : [],
      }])

      if (profileError) {
        // If duplicate key — profile already exists, just redirect
        if (profileError.code === '23505') {
          router.push('/dashboard/model?welcome=1')
          return
        }
        setError('Profile setup failed: ' + profileError.message + ' (code: ' + profileError.code + ')')
        setLoading(false)
        return
      }
      router.push('/dashboard/model?welcome=1')

    } else {
      const { error: profileError } = await supabase.from('agency_profiles').insert([{
        id: userId,
        agency_name: agencyForm.agencyName,
        contact_person: agencyForm.contactPerson,
        city: agencyForm.city,
        website: agencyForm.website || null,
      }])

      if (profileError) {
        if (profileError.code === '23505') {
          router.push('/dashboard/agency?welcome=1')
          return
        }
        setError('Profile setup failed: ' + profileError.message + ' (code: ' + profileError.code + ')')
        setLoading(false)
        return
      }
      router.push('/dashboard/agency?welcome=1')
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c9a84c]/50 transition-colors"
  const labelCls = "block text-xs font-bold tracking-widest uppercase text-white/35 mb-2"

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-3xl font-bold">
            The Artist <span className="text-[#c9a84c]">Portal</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Create your account</h1>
          <p className="text-white/40 text-sm">Bangladesh's premier model platform</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-7">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'account' ? 'text-[#c9a84c]' : 'text-green-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${step === 'account' ? 'bg-[#c9a84c] text-black' : 'bg-green-400 text-black'}`}>
              {step === 'profile' ? '✓' : '1'}
            </div>
            Account
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'profile' ? 'text-[#c9a84c]' : 'text-white/25'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${step === 'profile' ? 'bg-[#c9a84c] text-black' : 'bg-white/10 text-white/30'}`}>
              2
            </div>
            Profile
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">

          {/* Step 1 — Account */}
          {step === 'account' && (
            <>
              {/* Role toggle */}
              <div className="flex bg-white/5 rounded-xl p-1 mb-7 gap-1">
                {(['model', 'agency'] as const).map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all
                      ${role === r ? 'bg-[#c9a84c] text-black' : 'text-white/40 hover:text-white'}`}>
                    {r === 'model' ? "👤 I'm a Model" : "🏢 I'm an Agency"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAccountStep} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input className={inputCls} type="email" placeholder="your@email.com"
                    value={account.email} onChange={setAcc('email')} required />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input className={inputCls} type="password" placeholder="Minimum 6 characters"
                    value={account.password} onChange={setAcc('password')} required />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input className={inputCls} type="password" placeholder="Repeat your password"
                    value={account.confirmPassword} onChange={setAcc('confirmPassword')} required />
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 whitespace-pre-line">
                    {error}
                  </div>
                )}
                <button type="submit"
                  className="w-full mt-2 bg-[#c9a84c] text-black font-bold py-4 rounded-xl hover:bg-[#e8c97a] transition-all">
                  Continue →
                </button>
                <p className="text-center text-sm text-white/30">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#c9a84c] hover:underline">Sign in</Link>
                </p>
              </form>
            </>
          )}

          {/* Step 2 — Profile */}
          {step === 'profile' && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] px-3 py-1 rounded-full font-semibold">
                  {role === 'model' ? '👤 Model Profile' : '🏢 Agency Profile'}
                </span>
                <button type="button" onClick={() => { setStep('account'); setError('') }}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back</button>
              </div>

              {role === 'model' ? (
                <>
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input className={inputCls} placeholder="Rina Akter" value={modelForm.name}
                      onChange={setM('name')} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Age</label>
                      <input className={inputCls} type="number" placeholder="22" min="18"
                        value={modelForm.age} onChange={setM('age')} />
                    </div>
                    <div>
                      <label className={labelCls}>Height</label>
                      <input className={inputCls} placeholder="e.g. 5ft 4in"
                        value={modelForm.height} onChange={setM('height')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>District</label>
                      <select className={inputCls + ' cursor-pointer'} value={modelForm.city} onChange={setM('city')}>
                        {BD_DISTRICTS.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Specialization</label>
                      <select className={inputCls + ' cursor-pointer'} value={modelForm.specialization} onChange={setM('specialization')}>
                        <option value="" className="bg-[#1a1a1a]">Select...</option>
                        {SPECIALIZATIONS.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input className={inputCls} placeholder="01XXXXXXXXX"
                        value={modelForm.phone} onChange={setM('phone')} />
                    </div>
                    <div>
                      <label className={labelCls}>Instagram</label>
                      <input className={inputCls} placeholder="@yourhandle"
                        value={modelForm.instagram} onChange={setM('instagram')} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelCls}>Agency / Brand Name *</label>
                    <input className={inputCls} placeholder="Creative Hub BD"
                      value={agencyForm.agencyName} onChange={setA('agencyName')} required />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Person</label>
                    <input className={inputCls} placeholder="Karim Ahmed"
                      value={agencyForm.contactPerson} onChange={setA('contactPerson')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>City / District</label>
                      <select className={inputCls + ' cursor-pointer'} value={agencyForm.city} onChange={setA('city')}>
                        {BD_DISTRICTS.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Website (optional)</label>
                      <input className={inputCls} placeholder="https://..."
                        value={agencyForm.website} onChange={setA('website')} />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 whitespace-pre-line leading-relaxed">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full mt-2 bg-[#c9a84c] text-black font-bold py-4 rounded-xl hover:bg-[#e8c97a] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating Account...' : 'Complete Registration →'}
              </button>

              <p className="text-center text-xs text-white/25">
                By registering you agree to our Terms of Service
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}