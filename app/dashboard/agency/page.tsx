'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Job, Application } from '@/types'
import { timeAgo, formatTaka, formatBDT, parseBDTInput } from '@/lib/utils'
import Link from 'next/link'
import PhotoUpload from '@/components/ui/PhotoUpload'

const BD_DISTRICTS = ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barishal','Comilla','Gazipur','Narayanganj','Mymensingh','Rangpur','Jessore','Bogra','Dinajpur','Tangail']

export default function AgencyDashboard() {
  const { user, role, agencyProfile, refreshProfile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'

  const [tab, setTab] = useState<'jobs' | 'applications' | 'profile'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(isWelcome)
  const [showPostForm, setShowPostForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [jobForm, setJobForm] = useState({
    title: '', location: 'Dhaka', payRaw: '', description: '', type: 'Commercial',
    gender_requirement: 'Any', age_range: '', min_height: '', experience_level: 'Any Level', shoot_date: '',
  })
  const [profileForm, setProfileForm] = useState({
    agency_name: '', contact_person: '', city: 'Dhaka', website: '', description: '',
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && role === 'model') router.push('/dashboard/model')
  }, [user, role, loading])

  useEffect(() => {
    if (agencyProfile) setProfileForm({
      agency_name: agencyProfile.agency_name || '',
      contact_person: agencyProfile.contact_person || '',
      city: agencyProfile.city || 'Dhaka',
      website: agencyProfile.website || '',
      description: agencyProfile.description || '',
    })
  }, [agencyProfile])

  useEffect(() => { if (user) fetchJobs() }, [user])

  useEffect(() => {
    if (tab === 'applications') {
      if (!selectedJobId && jobs.length > 0) setSelectedJobId(jobs[0].id)
      else if (selectedJobId) fetchApplications(selectedJobId)
    }
  }, [tab, jobs])

  useEffect(() => {
    if (selectedJobId) fetchApplications(selectedJobId)
  }, [selectedJobId])

  const fetchJobs = async () => {
    setDataLoading(true)
    const { data } = await supabase.from('jobs').select('*').eq('agency_id', user!.id).order('created_at', { ascending: false })
    setJobs(data || [])
    setDataLoading(false)
  }

  const fetchApplications = async (jobId: string) => {
    setDataLoading(true)
    const { data } = await supabase
      .from('applications')
      .select('*, models(name, age, city, height, specialization, phone, bio, instagram, experience_years, is_available)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setDataLoading(false)
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setPosting(true)
    const { error } = await supabase.from('jobs').insert([{
      title: jobForm.title,
      location: jobForm.location,
      description: jobForm.description,
      type: jobForm.type,
      gender_requirement: jobForm.gender_requirement,
      age_range: jobForm.age_range,
      min_height: jobForm.min_height,
      experience_level: jobForm.experience_level,
      shoot_date: jobForm.shoot_date || null,
      agency_id: user.id,
      pay_amount: parseBDTInput(jobForm.payRaw).amount,
      pay_display: parseBDTInput(jobForm.payRaw).display,
    }])
    setPosting(false)
    if (!error) {
      setPostSuccess(true); setShowPostForm(false)
      setJobForm({ title: '', location: 'Dhaka', payRaw: '', description: '', type: 'Commercial', gender_requirement: 'Any', age_range: '', min_height: '', experience_level: 'Any Level', shoot_date: '' })
      fetchJobs()
      setTimeout(() => setPostSuccess(false), 4000)
    }
  }

  const handleUpdateStatus = async (appId: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', appId)
    if (selectedJobId) fetchApplications(selectedJobId)
  }

  const handleToggleJob = async (jobId: string, isOpen: boolean) => {
    await supabase.from('jobs').update({ is_open: !isOpen }).eq('id', jobId)
    fetchJobs()
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('agency_profiles').update(profileForm).eq('id', user.id)
    await refreshProfile()
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const totalApplicants = jobs.reduce((sum) => sum, 0)
  const openJobs = jobs.filter(j => j.is_open).length

  const statusColor = (s: string) => {
    if (s === 'accepted') return 'text-green-400 bg-green-400/10 border-green-400/20'
    if (s === 'rejected') return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (s === 'reviewed') return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c9a84c]/50 transition-colors"
  const labelCls = "block text-xs font-bold tracking-widest uppercase text-white/35 mb-2"

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-white/30 text-sm animate-pulse">Loading...</div></div>

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Welcome banner */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-[#c9a84c]/15 to-[#c9a84c]/5 border border-[#c9a84c]/25 rounded-2xl px-6 py-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base mb-0.5">🎉 Welcome, {agencyProfile?.agency_name}!</div>
              <div className="text-sm text-white/50">Start by posting your first job to find the perfect model.</div>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-white/30 hover:text-white text-xl">×</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-1">Agency Dashboard</p>
            <h1 className="font-playfair text-3xl font-bold">{agencyProfile?.agency_name || 'My Dashboard'}</h1>
            <p className="text-white/30 text-sm mt-1">{user?.email} · 📍 {agencyProfile?.city}</p>
          </div>
          <Link href="/models" className="text-xs bg-[#c9a84c] text-black font-bold px-4 py-2.5 rounded-lg hover:bg-[#e8c97a] transition-all">
            Find Models →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          <div className="bg-white/[0.03] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#c9a84c]">{jobs.length}</div>
            <div className="text-xs text-white/35 mt-1">Total Jobs</div>
          </div>
          <div className="bg-white/[0.03] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{openJobs}</div>
            <div className="text-xs text-white/35 mt-1">Open Jobs</div>
          </div>
          <div className="bg-white/[0.03] border border-white/7 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{applications.length}</div>
            <div className="text-xs text-white/35 mt-1">Applicants Shown</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-7">
          {([['jobs', '📋 My Jobs'], ['applications', '👥 Applicants'], ['profile', '⚙️ Profile']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all
                ${tab === t ? 'bg-[#c9a84c] text-black' : 'text-white/40 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* JOBS TAB */}
        {tab === 'jobs' && (
          <div>
            {postSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 text-sm text-green-400 mb-5">
                ✅ Job posted! Models across Bangladesh can now apply.
              </div>
            )}

            <button onClick={() => setShowPostForm(!showPostForm)}
              className="w-full mb-5 border-2 border-dashed border-[#c9a84c]/30 text-[#c9a84c]/70 hover:border-[#c9a84c] hover:text-[#c9a84c] rounded-2xl py-4 text-sm font-semibold transition-all">
              {showPostForm ? '✕ Cancel' : '＋ Post a New Job'}
            </button>

            {showPostForm && (
              <form onSubmit={handlePostJob} className="bg-white/[0.02] border border-white/8 rounded-2xl p-7 mb-5 flex flex-col gap-5">
                <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c]">New Job Listing</p>
                <div>
                  <label className={labelCls}>Job Title *</label>
                  <input className={inputCls} placeholder="e.g. Commercial Shoot for Fashion Brand" required
                    value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Job Type</label>
                    <select className={inputCls + ' cursor-pointer'} value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))}>
                      {['Commercial','Runway','Editorial','Fitness','Print','High Fashion','Bridal','Catalog'].map(t => (
                        <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <select className={inputCls + ' cursor-pointer'} value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))}>
                      {BD_DISTRICTS.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Pay Rate (৳ Taka)</label>
                    <div className="relative">
                      <input
                        className={inputCls + ' pr-24'}
                        placeholder="e.g. 8000"
                        value={jobForm.payRaw}
                        onChange={e => setJobForm(f => ({ ...f, payRaw: e.target.value.replace(/[^0-9]/g, '') }))}
                        inputMode="numeric"
                      />
                      {jobForm.payRaw && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#c9a84c] pointer-events-none">
                          = {parseBDTInput(jobForm.payRaw).display}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Shoot Date</label>
                    <input className={inputCls} type="date" value={jobForm.shoot_date} onChange={e => setJobForm(f => ({ ...f, shoot_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls + ' resize-none min-h-[90px]'}
                    placeholder="Describe the shoot, requirements, and what you're looking for..."
                    value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select className={inputCls + ' cursor-pointer'} value={jobForm.gender_requirement} onChange={e => setJobForm(f => ({ ...f, gender_requirement: e.target.value }))}>
                      {['Any','Female','Male'].map(g => <option key={g} value={g} className="bg-[#1a1a1a]">{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Age Range</label>
                    <input className={inputCls} placeholder="18–28" value={jobForm.age_range} onChange={e => setJobForm(f => ({ ...f, age_range: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Experience</label>
                    <select className={inputCls + ' cursor-pointer'} value={jobForm.experience_level} onChange={e => setJobForm(f => ({ ...f, experience_level: e.target.value }))}>
                      {['Any Level','Beginner','Intermediate','Experienced'].map(e => <option key={e} value={e} className="bg-[#1a1a1a]">{e}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={posting}
                  className="w-full bg-[#c9a84c] text-black font-bold py-3.5 rounded-xl hover:bg-[#e8c97a] transition-all disabled:opacity-50">
                  {posting ? 'Publishing...' : 'Publish Job →'}
                </button>
              </form>
            )}

            {jobs.length === 0 && !showPostForm ? (
              <div className="text-center py-16 text-white/30">
                <div className="text-5xl mb-3">📝</div>
                <p className="mb-2">No jobs posted yet.</p>
                <p className="text-xs">Click "Post a New Job" to get started!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${job.is_open ? 'bg-green-400' : 'bg-white/20'}`} />
                          <span className="text-xs text-white/35">{job.is_open ? 'Open' : 'Closed'}</span>
                          <span className="text-xs text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-2.5 py-0.5 rounded-full ml-1">{job.type}</span>
                        </div>
                        <div className="font-bold text-base mb-1">{job.title}</div>
                        <div className="flex gap-3 flex-wrap text-xs text-white/35">
                          <span>📍 {job.location}</span>
                          <span>💰 {job.pay_amount ? formatBDT((job as any).pay_amount) : (job as any).pay_display || 'Negotiable'}</span>
                          {job.shoot_date && <span>📅 {new Date(job.shoot_date).toLocaleDateString('en-BD')}</span>}
                          <span>{timeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleJob(job.id, job.is_open)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
                            ${job.is_open
                              ? 'border-white/15 text-white/40 hover:border-red-500/30 hover:text-red-400'
                              : 'border-green-500/25 text-green-400 hover:bg-green-500/10'}`}>
                          {job.is_open ? 'Close' : 'Reopen'}
                        </button>
                        <button
                          onClick={() => { setSelectedJobId(job.id); setTab('applications') }}
                          className="text-xs font-semibold border border-[#c9a84c]/30 text-[#c9a84c] px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition-all">
                          Applicants →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPLICANTS TAB */}
        {tab === 'applications' && (
          <div>
            {jobs.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p>Post a job first to see applicants.</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <label className={labelCls}>Select Job to View Applicants</label>
                  <select className={inputCls + ' cursor-pointer'} value={selectedJobId || ''}
                    onChange={e => setSelectedJobId(e.target.value)}>
                    {jobs.map(j => <option key={j.id} value={j.id} className="bg-[#1a1a1a]">{j.title} ({j.is_open ? 'Open' : 'Closed'})</option>)}
                  </select>
                </div>

                {dataLoading ? (
                  <div className="text-center py-12 text-white/30">Loading applicants...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <div className="text-5xl mb-3">👥</div>
                    <p>No applications yet for this job.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-white/35"><span className="text-white font-semibold">{applications.length}</span> applicant{applications.length !== 1 ? 's' : ''}</p>
                    {applications.map(app => {
                      const model = app.models as any
                      return (
                        <div key={app.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                            <div>
                              <div className="font-bold text-base mb-0.5">{model?.name}</div>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-white/40">
                                {model?.age && <span>🎂 {model.age} yrs</span>}
                                {model?.city && <span>📍 {model.city}</span>}
                                {model?.height && <span>📏 {model.height}</span>}
                                {model?.specialization && <span>⭐ {model.specialization}</span>}
                                {model?.experience_years > 0 && <span>🏅 {model.experience_years} yrs exp</span>}
                              </div>
                              <div className="flex gap-3 mt-1.5 text-xs">
                                {model?.phone && <span className="text-white/50">📞 {model.phone}</span>}
                                {model?.instagram && <span className="text-white/50">📸 {model.instagram}</span>}
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${statusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          {model?.bio && (
                            <p className="text-xs text-white/35 mb-3 leading-relaxed border-l-2 border-white/10 pl-3">{model.bio}</p>
                          )}
                          {app.message && (
                            <div className="bg-white/3 border border-white/6 rounded-xl p-3 text-xs text-white/45 italic mb-4">
                              "{app.message}"
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap items-center">
                            <button onClick={() => handleUpdateStatus(app.id, 'accepted')}
                              className="text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-all">
                              ✓ Accept
                            </button>
                            <button onClick={() => handleUpdateStatus(app.id, 'reviewed')}
                              className="text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-all">
                              👁 Reviewed
                            </button>
                            <button onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              className="text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all">
                              ✕ Reject
                            </button>
                            <span className="text-xs text-white/20 ml-auto">{timeAgo(app.created_at)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-7 flex flex-col gap-5">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-2 self-start">Agency Logo</p>
              <PhotoUpload
                userId={user!.id}
                currentUrl={agencyProfile?.logo_url || null}
                bucket="avatars"
                shape="square"
                label="Upload Logo"
                onUpload={async (url) => {
                  await supabase.from('agency_profiles').update({ logo_url: url }).eq('id', user!.id)
                  await refreshProfile()
                }}
              />
            </div>
            <div className="border-t border-white/6 pt-4">
            <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c]">Agency Information</p>
            <div>
              <label className={labelCls}>Agency / Brand Name</label>
              <input className={inputCls} value={profileForm.agency_name} onChange={e => setProfileForm(f => ({ ...f, agency_name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Contact Person</label>
              <input className={inputCls} value={profileForm.contact_person} onChange={e => setProfileForm(f => ({ ...f, contact_person: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City / District</label>
                <select className={inputCls + ' cursor-pointer'} value={profileForm.city} onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))}>
                  {BD_DISTRICTS.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input className={inputCls} placeholder="https://..." value={profileForm.website} onChange={e => setProfileForm(f => ({ ...f, website: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Agency Description</label>
              <textarea className={inputCls + ' resize-none min-h-[90px]'}
                placeholder="Describe your agency, what kind of work you do..."
                value={profileForm.description} onChange={e => setProfileForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full bg-[#c9a84c] text-black font-bold py-3.5 rounded-xl hover:bg-[#e8c97a] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : saved ? '✓ Profile Saved!' : 'Save Profile'}
            </button>
            </div>{/* close agency info section */}
            <div className="pt-2 border-t border-white/6">
              <Link href={`/profile/agency/${user?.id}`}
                className="text-xs font-semibold text-[#c9a84c] border border-[#c9a84c]/25 px-4 py-2 rounded-lg hover:bg-[#c9a84c]/10 transition-all inline-block">
                👁 View Public Profile →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
