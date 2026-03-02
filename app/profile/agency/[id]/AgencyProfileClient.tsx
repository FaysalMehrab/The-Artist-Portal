'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import type { AgencyProfile, Job } from '@/types'
import { timeAgo, formatTaka } from '@/lib/utils'

export default function AgencyProfileClient({ agency, jobs }: { agency: AgencyProfile; jobs: Job[] }) {
  const { user } = useAuth()
  const initials = agency.agency_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-r from-[#1a1a1a] via-[#c9a84c]/10 to-black border-b border-white/6">
        <div className="absolute inset-0 hero-grid opacity-40" />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 mb-10">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-black bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-2xl font-black text-black flex-shrink-0 shadow-2xl">
            {initials}
          </div>

          <div className="flex-1 pt-2 md:pt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-playfair text-3xl font-bold mb-1">{agency.agency_name}</h1>
                <p className="text-white/40 text-sm">📍 {agency.city}, Bangladesh</p>
                {agency.contact_person && (
                  <p className="text-white/35 text-sm mt-0.5">Contact: {agency.contact_person}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                {agency.is_verified && (
                  <span className="text-xs font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1.5 rounded-full">
                    ✓ Verified Agency
                  </span>
                )}
                {agency.website && (
                  <a href={agency.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-white/50 border border-white/15 px-3 py-1.5 rounded-full hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-all">
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-4">Agency Info</p>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">📍 Location</span>
                  <span>{agency.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">📋 Open Jobs</span>
                  <span className="font-bold text-[#c9a84c]">{jobs.length}</span>
                </div>
                {agency.contact_person && (
                  <div className="flex justify-between">
                    <span className="text-white/40">👤 Contact</span>
                    <span>{agency.contact_person}</span>
                  </div>
                )}
              </div>
            </div>

            {!user && (
              <div className="bg-gradient-to-br from-[#c9a84c]/10 to-transparent border border-[#c9a84c]/20 rounded-2xl p-5 text-center">
                <p className="text-sm font-semibold mb-2">Want to apply for their jobs?</p>
                <p className="text-xs text-white/40 mb-4">Create a free model account to apply for bookings.</p>
                <Link href="/register"
                  className="block w-full bg-[#c9a84c] text-black font-bold py-2.5 rounded-xl text-sm hover:bg-[#e8c97a] transition-all">
                  Join as a Model
                </Link>
              </div>
            )}
          </div>

          {/* Right: description + jobs */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {agency.description && agency.description.trim() && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-3">About</p>
                <p className="text-sm text-white/70 leading-relaxed">{agency.description}</p>
              </div>
            )}

            {/* Open jobs */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-4">
                Open Jobs ({jobs.length})
              </p>
              {jobs.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">No open jobs right now.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {jobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between gap-4 py-3 border-b border-white/6 last:border-0">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-0.5">{job.title}</div>
                        <div className="flex gap-2 text-xs text-white/35">
                          <span className="text-[#c9a84c]">{job.type}</span>
                          <span>·</span>
                          <span>📍 {job.location}</span>
                          <span>·</span>
                          <span>{timeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[#c9a84c]">{formatTaka(job.pay)}</div>
                        <Link href="/jobs"
                          className="text-xs text-white/40 hover:text-[#c9a84c] transition-colors">Apply →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/jobs" className="text-sm text-white/35 hover:text-[#c9a84c] transition-colors">
            ← Browse all jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
