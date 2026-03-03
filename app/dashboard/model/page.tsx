'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Application } from '@/types'
import { timeAgo, formatTaka, formatBDT } from '@/lib/utils'
import Link from 'next/link'
import PhotoUpload from '@/components/ui/PhotoUpload'
import PortfolioUpload from '@/components/ui/PortfolioUpload'

const BD_DISTRICTS = ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barishal','Comilla','Gazipur','Narayanganj','Mymensingh','Rangpur','Jessore','Bogra','Dinajpur','Tangail']
const SPECIALIZATIONS = ['Commercial','Runway','Editorial','Fitness','Print','High Fashion','Catalog','Bridal']

export default function ModelDashboard() {
  const { user, role, modelProfile, refreshProfile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'

  const [tab, setTab] = useState<'profile' | 'applications' | 'saved'>('profile')
  const [applications, setApplications] = useState<Application[]>([])
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showWelcome, setShowWelcome] = useState(isWelcome)

  const [form, setForm] = useState({
    name: '', age: '', city: 'Dhaka', height: '', specialization: '',
    bio: '', phone: '', instagram: '', experience_years: '0', is_available: true, photo_url: '',
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && role === 'agency') router.push('/dashboard/agency')
  }, [user, role, loading])

  useEffect(() => {
    if (modelProfile) {
      setForm({
        name: modelProfile.name || '',
        age: modelProfile.age?.toString() || '',
        city: modelProfile.city || 'Dhaka',
        height: modelProfile.height || '',
        specialization: modelProfile.specialization || '',
        bio: modelProfile.bio || '',
        phone: modelProfile.phone || '',
        instagram: (modelProfile as any).instagram || '',
        experience_years: modelProfile.experience_years?.toString() || '0',
        is_available: modelProfile.is_available ?? true,
        photo_url: modelProfile.photo_url || '',
      })
    }
  }, [modelProfile])

  useEffect(() => {
    if (user) {
      fetchApplications()
      fetchSavedJobs()
    }
  }, [user])

  useEffect(() => {
    if (tab === 'applications' && user) fetchApplications()
    if (tab === 'saved' && user) fetchSavedJobs()
  }, [tab])

  const fetchApplications = async () => {
    setDataLoading(true)
    const { data } = await supabase
      .from('applications')
      .select('*, jobs(title, pay_amount, pay_display, location, type, shoot_date, agency_profiles(agency_name))')
      .eq('model_id', user!.id)
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setDataLoading(false)
  }

  const fetchSavedJobs = async () => {
    setDataLoading(true)
    const { data } = await supabase
      .from('saved_jobs')
      .select('*, jobs(*, agency_profiles(agency_name))')
      .eq('model_id', user!.id)
      .order('created_at', { ascending: false })
    setSavedJobs(data || [])
    setDataLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('models').update({
      name: form.name, age: parseInt(form.age) || null,
      city: form.city, height: form.height, specialization: form.specialization,
      bio: form.bio, phone: form.phone, instagram: form.instagram,
      experience_years: parseInt(form.experience_years) || 0,
      is_available: form.is_available,
      tags: form.specialization ? [form.specialization] : [],
    }).eq('id', user.id)
    await refreshProfile()
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const profileStrength = () => {
    const fields = [form.name, form.age, form.city, form.height, form.specialization, form.bio, form.phone]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }

  const statusColor = (s: string) => {
    if (s === 'accepted') return 'text-green-400 bg-green-400/10 border-green-400/20'
    if (s === 'rejected') return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (s === 'reviewed') return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c9a84c]/50 transition-colors"
  const labelCls = "block text-xs font-bold tracking-widest uppercase text-white/35 mb-2"

  const strength = profileStrength()
  const appStats = {
    total: applications.length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    pending: applications.filter(a => a.status === 'pending').length,
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-white/30 text-sm animate-pulse">Loading...</div></div>

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Welcome banner */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-[#c9a84c]/15 to-[#c9a84c]/5 border border-[#c9a84c]/25 rounded-2xl px-6 py-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base mb-0.5">🎉 Welcome to The Artist Portal!</div>
              <div className="text-sm text-white/50">Complete your profile to start applying for jobs.</div>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-white/30 hover:text-white text-xl flex-shrink-0">×</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-1">Model Dashboard</p>
            <h1 className="font-playfair text-3xl font-bold">{modelProfile?.name || 'My Dashboard'}</h1>
            <p className="text-white/30 text-sm mt-1">{user?.email}</p>
          </div>
          <Link href="/jobs" className="text-xs bg-[#c9a84c] text-black font-bold px-4 py-2.5 rounded-lg hover:bg-[#e8c97a] transition-all">
            Browse Jobs →
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          <div className="bg-white/[0.03] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#c9a84c]">{appStats.total}</div>
            <div className="text-xs text-white/35 mt-1">Applications</div>
          </div>
          <div className="bg-white/[0.03] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{appStats.accepted}</div>
            <div className="text-xs text-white/35 mt-1">Accepted</div>
          </div>
          <div className="bg-white/[0.03] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{savedJobs.length}</div>
            <div className="text-xs text-white/35 mt-1">Saved Jobs</div>
          </div>
        </div>

        {/* Profile strength */}
        <div className="bg-white/[0.02] border border-white/7 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/50">Profile Completeness</span>
            <span className={`text-xs font-bold ${strength === 100 ? 'text-green-400' : strength >= 70 ? 'text-[#c9a84c]' : 'text-red-400'}`}>{strength}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${strength === 100 ? 'bg-green-400' : strength >= 70 ? 'bg-[#c9a84c]' : 'bg-red-400'}`}
              style={{ width: `${strength}%` }} />
          </div>
          {strength < 100 && <p className="text-xs text-white/25 mt-2">Fill in all fields to get more visibility from agencies</p>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-7">
          {([['profile', '✏️ Edit Profile'], ['applications', `📋 Applications${appStats.total ? ` (${appStats.total})` : ''}`], ['saved', '🔖 Saved Jobs']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all
                ${tab === t ? 'bg-[#c9a84c] text-black' : 'text-white/40 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-7 flex flex-col gap-5">
            {/* Photo upload */}
            <div>
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-4">Profile Photo</p>
              <div className="flex flex-col items-center gap-1">
                {user && (
                <PhotoUpload
                  userId={user.id}
                  currentUrl={form.photo_url}
                  bucket="avatars"
                  shape="circle"
                  label="Upload Photo"
                  onUpload={async (url) => {
                    setForm(f => ({ ...f, photo_url: url }))
                    await supabase.from('models').update({ photo_url: url }).eq('id', user.id)
                    await refreshProfile()
                  }}
                />
                )}
              </div>
            </div>

            <div className="border-t border-white/6 pt-4">
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-4">Personal Information</p>
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Age</label>
                <input className={inputCls} type="number" min="18" placeholder="22" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Height</label>
                <input className={inputCls} placeholder="e.g. 5ft 4in" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>District</label>
                <select className={inputCls + ' cursor-pointer'} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                  {BD_DISTRICTS.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Specialization</label>
                <select className={inputCls + ' cursor-pointer'} value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}>
                  <option value="" className="bg-[#1a1a1a]">Select...</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone (BD)</label>
                <input className={inputCls} placeholder="01XXXXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Instagram Handle</label>
                <input className={inputCls} placeholder="@yourhandle" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Years of Experience</label>
              <input className={inputCls} type="number" min="0" placeholder="0" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea className={inputCls + ' resize-none min-h-[90px] leading-relaxed'}
                placeholder="Tell agencies about yourself, your experience, and what makes you unique..."
                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between bg-white/3 border border-white/7 rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Available for Bookings</div>
                <div className="text-xs text-white/35 mt-0.5">Agencies can see you're ready to work</div>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                className={`relative w-12 h-6 rounded-full transition-all ${form.is_available ? 'bg-green-500' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_available ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-[#c9a84c] text-black font-bold py-3.5 rounded-xl hover:bg-[#e8c97a] transition-all disabled:opacity-50 mt-1">
              {saving ? 'Saving...' : saved ? '✓ Profile Saved!' : 'Save Profile'}
            </button>
            </div>{/* close personal info section */}

            {/* Portfolio Photos */}
            <div className="border-t border-white/6 pt-5">
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-3">Portfolio Photos</p>
              <p className="text-xs text-white/35 mb-4">Add up to 8 photos. These will be visible on your public profile.</p>
              {user && (
              <PortfolioUpload
                userId={user.id}
                existingUrls={(modelProfile as any)?.portfolio_urls || []}
                onUpdate={async (urls) => {
                  await supabase.from('models').update({ portfolio_urls: urls }).eq('id', user.id)
                  await refreshProfile()
                }}
              />
              )}
            </div>

            {/* View Profile link */}
            <div className="pt-2 border-t border-white/6">
              <Link href={`/profile/model/${user?.id}`}
                className="text-xs font-semibold text-[#c9a84c] border border-[#c9a84c]/25 px-4 py-2 rounded-lg hover:bg-[#c9a84c]/10 transition-all inline-block">
                👁 View Public Profile →
              </Link>
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {tab === 'applications' && (
          <div>
            {dataLoading ? (
              <div className="text-center py-16 text-white/30">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-white/40 mb-5">No applications yet.</p>
                <Link href="/jobs" className="bg-[#c9a84c] text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#e8c97a] transition-all">
                  Browse Jobs →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {applications.map(app => {
                  const job = app.jobs as any
                  return (
                    <div key={app.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                        <div className="flex-1">
                          <div className="font-bold text-base">{job?.title}</div>
                          <div className="text-sm text-white/40 mt-1">{job?.agency_profiles?.agency_name} · 📍 {job?.location}</div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize flex-shrink-0 ${statusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {(job?.pay_amount || job?.pay_display) && <span className="text-xs text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-3 py-1 rounded-full">{job.pay_amount ? formatBDT(job.pay_amount) : job.pay_display}</span>}
                        {job?.type && <span className="text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{job.type}</span>}
                        {job?.shoot_date && <span className="text-xs text-white/40">📅 {new Date(job.shoot_date).toLocaleDateString('en-BD')}</span>}
                        <span className="text-xs text-white/25 ml-auto">{timeAgo(app.created_at)}</span>
                      </div>
                      {app.message && (
                        <div className="mt-3 bg-white/3 border border-white/6 rounded-xl p-3 text-xs text-white/40 italic">
                          "{app.message}"
                        </div>
                      )}
                      {app.status === 'accepted' && (
                        <div className="mt-3 bg-green-500/8 border border-green-500/15 rounded-xl px-4 py-3 text-xs text-green-400">
                          🎉 Congratulations! The agency has accepted your application. They will contact you shortly.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* SAVED JOBS TAB */}
        {tab === 'saved' && (
          <div>
            {dataLoading ? (
              <div className="text-center py-16 text-white/30">Loading...</div>
            ) : savedJobs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔖</div>
                <p className="text-white/40 mb-5">No saved jobs yet. Bookmark jobs you're interested in!</p>
                <Link href="/jobs" className="bg-[#c9a84c] text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#e8c97a] transition-all">
                  Browse Jobs →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {savedJobs.map(saved => {
                  const job = saved.jobs as any
                  return (
                    <div key={saved.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1">{job?.title}</div>
                        <div className="text-sm text-white/40">{job?.agency_profiles?.agency_name} · {job?.location}</div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-2.5 py-0.5 rounded-full">{job?.pay_amount ? formatBDT(job.pay_amount) : job?.pay_display || 'Negotiable'}</span>
                          <span className="text-xs text-white/40">{job?.type}</span>
                        </div>
                      </div>
                      <Link href="/jobs" className="bg-[#c9a84c] text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#e8c97a] transition-all flex-shrink-0">
                        Apply →
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}