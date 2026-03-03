'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Job } from '@/types'
import { timeAgo, formatTaka, formatBDT } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import Toast from '@/components/ui/Toast'

const BD_DISTRICTS = ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barishal','Comilla','Gazipur','Rangpur','Mymensingh']
const JOB_TYPES = ['Commercial','Runway','Editorial','Fitness','Print','High Fashion','Bridal']

export default function JobsClient({ jobs }: { jobs: Job[] }) {
  const { user, role, modelProfile } = useAuth()
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState('')
  const [applying, setApplying] = useState<Job | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [toast, setToast] = useState({ visible: false, msg: '', icon: '✅' })

  // Load existing applications and saved jobs from DB so status persists after refresh
  useEffect(() => {
    if (!user || role !== 'model') return
    const load = async () => {
      const [{ data: apps }, { data: saved }] = await Promise.all([
        supabase.from('applications').select('job_id').eq('model_id', user.id),
        supabase.from('saved_jobs').select('job_id').eq('model_id', user.id),
      ])
      if (apps) setAppliedIds(apps.map((a: any) => a.job_id))
      if (saved) setSavedIds(saved.map((s: any) => s.job_id))
    }
    load()
  }, [user, role])

  const toggleType = (t: string) =>
    setTypeFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const filtered = jobs.filter(j => {
    const matchType = typeFilter.length === 0 || typeFilter.includes(j.type)
    const matchLoc = !locationFilter || j.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchType && matchLoc
  })

  const showToast = (msg: string, icon = '✅') => setToast({ visible: true, msg, icon })

  const handleSaveJob = async (jobId: string) => {
    if (!user || !modelProfile) { router.push('/login'); return }
    if (savedIds.includes(jobId)) return
    const { error } = await supabase.from('saved_jobs').insert([{ model_id: user.id, job_id: jobId }])
    if (!error) { setSavedIds(ids => [...ids, jobId]); showToast('Job saved to your dashboard! 🔖') }
  }

  const handleApply = async () => {
    if (!user || !modelProfile) { router.push('/login'); return }
    if (!applying) return
    setSubmitting(true)
    const { error } = await supabase.from('applications').insert([{
      job_id: applying.id, model_id: user.id, message, status: 'pending',
    }])
    setSubmitting(false)
    setApplying(null); setMessage('')
    if (error?.code === '23505') showToast('You already applied for this job.', '⚠️')
    else if (error) showToast('Failed to apply. Please try again.', '❌')
    else { setAppliedIds(ids => [...ids, applying.id]); showToast('Application sent! Check your dashboard. ✅') }
  }

  const openApply = (job: Job) => {
    if (!user) { router.push('/login'); return }
    if (role === 'agency') { showToast('Only models can apply.', '⚠️'); return }
    setApplying(job)
  }

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#c9a84c]/8 to-transparent border-b border-white/6 px-6 py-14 text-center">
        <p className="text-[11px] tracking-[3px] uppercase font-bold text-[#c9a84c] mb-3">✦ Latest Opportunities</p>
        <h1 className="font-playfair text-5xl font-bold mb-3">Browse Jobs</h1>
        <p className="text-white/40 text-lg">{jobs.length} opportunities across Bangladesh</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-14 py-12 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">

        {/* Sidebar */}
        <div className="hidden md:block">
          <div className="sticky top-24 flex flex-col gap-6">
            <div>
              <p className="text-[11px] tracking-[2px] uppercase text-white/35 font-bold mb-4">Job Type</p>
              {JOB_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)}
                  className="flex items-center gap-3 w-full py-2 text-sm text-left transition-colors hover:text-white"
                  style={{ color: typeFilter.includes(t) ? 'white' : 'rgba(255,255,255,0.45)' }}>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 transition-all
                    ${typeFilter.includes(t) ? 'bg-[#c9a84c] border-[#c9a84c]' : 'border-white/20'}`}>
                    {typeFilter.includes(t) && '✓'}
                  </span>
                  {t}
                </button>
              ))}
              {typeFilter.length > 0 && (
                <button onClick={() => setTypeFilter([])} className="text-xs text-[#c9a84c] mt-2 hover:underline">Clear filters</button>
              )}
            </div>

            <div>
              <p className="text-[11px] tracking-[2px] uppercase text-white/35 font-bold mb-3">District</p>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-[#c9a84c]/40"
                value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                <option value="" className="bg-[#1a1a1a]">All Districts</option>
                {BD_DISTRICTS.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
              </select>
            </div>

            {!user && (
              <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-xl p-4 text-center">
                <p className="text-xs text-white/45 mb-3 leading-relaxed">Sign in as a model to apply for jobs</p>
                <Link_or_a href="/register" className="text-xs font-bold text-[#c9a84c] hover:underline">Create Account →</Link_or_a>
              </div>
            )}
          </div>
        </div>

        {/* Job list */}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/35 mb-1">
            <span className="text-white font-semibold">{filtered.length}</span> jobs found
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-white/30">
              <div className="text-5xl mb-3">🔍</div>
              <p>No jobs match your filters.</p>
            </div>
          ) : filtered.map(job => {
            const agency = job.agency_profiles as any
            const applied = appliedIds.includes(job.id)
            const isSaved = savedIds.includes(job.id)

            return (
              <div key={job.id}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex justify-between items-start gap-5 transition-all hover:border-[#c9a84c]/25">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#c9a84c] to-[#8B6914] rounded-xl flex items-center justify-center text-sm font-black text-black flex-shrink-0">
                      {(agency?.agency_name || 'A')[0]}
                    </div>
                    <div>
                      <a href={`/profile/agency/${job.agency_id}`} className="text-sm font-semibold hover:text-[#c9a84c] transition-colors">{agency?.agency_name || 'Agency'}</a>
                      <div className="text-xs text-white/25">{timeAgo(job.created_at)}</div>
                    </div>
                  </div>
                  <div className="font-bold text-lg mb-2">{job.title}</div>
                  {job.description && (
                    <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-2">{job.description}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c] text-xs rounded-full px-3 py-1">{job.type}</span>
                    <span className="bg-white/5 border border-white/10 text-white/45 text-xs rounded-full px-3 py-1">📍 {job.location}</span>
                    {job.gender_requirement !== 'Any' && (
                      <span className="bg-white/5 border border-white/10 text-white/45 text-xs rounded-full px-3 py-1">{job.gender_requirement}</span>
                    )}
                    {job.shoot_date && (
                      <span className="bg-white/5 border border-white/10 text-white/45 text-xs rounded-full px-3 py-1">
                        📅 {new Date(job.shoot_date).toLocaleDateString('en-BD')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end gap-3">
                  <div className="text-xl font-black text-[#c9a84c]">{(job as any).pay_amount ? formatBDT((job as any).pay_amount) : (job as any).pay_display || formatTaka((job as any).pay) || "Negotiable"}</div>
                  {applied ? (
                    <span className="text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-lg">✓ Applied</span>
                  ) : (
                    <button onClick={() => openApply(job)}
                      className="bg-[#c9a84c] text-black text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#e8c97a] hover:shadow-[0_6px_20px_rgba(201,168,76,0.3)] transition-all whitespace-nowrap">
                      Apply Now
                    </button>
                  )}
                  {user && role === 'model' && (
                    <button onClick={() => handleSaveJob(job.id)}
                      className={`text-xs transition-all ${isSaved ? 'text-[#c9a84c]' : 'text-white/20 hover:text-[#c9a84c]'}`}
                      title="Save job">
                      {isSaved ? '🔖 Saved' : '🔖 Save'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Apply Modal */}
      {applying && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-6"
          onClick={() => setApplying(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full relative"
            onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-5 text-white/30 hover:text-white text-2xl transition-colors"
              onClick={() => setApplying(null)}>×</button>
            <h3 className="font-playfair text-2xl font-bold mb-1">Apply for Job</h3>
            <p className="text-[#c9a84c] text-sm font-medium mb-1">{applying.title}</p>
            <p className="text-xs text-white/30 mb-6">
              Applying as: <span className="text-white font-medium">{modelProfile?.name}</span>
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold tracking-widest uppercase text-white/35 mb-2">Cover Message (optional)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c9a84c]/40 resize-none min-h-[100px]"
                placeholder="Tell the agency why you're the perfect fit for this shoot..."
                value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <button disabled={submitting} onClick={handleApply}
              className="w-full bg-[#c9a84c] text-black font-bold py-3.5 rounded-xl hover:bg-[#e8c97a] transition-all disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Application →'}
            </button>
          </div>
        </div>
      )}

      <Toast visible={toast.visible} message={toast.msg} icon={toast.icon} onHide={() => setToast(t => ({ ...t, visible: false }))} />
    </div>
  )
}

// Simple anchor fallback for sidebar
function Link_or_a({ href, className, children }: any) {
  return <a href={href} className={className}>{children}</a>
}