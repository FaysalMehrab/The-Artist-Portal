'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import type { Model } from '@/types'
import Link from 'next/link'

export default function ModelProfileClient({
  model,
  portfolioUrls,
}: {
  model: Model
  portfolioUrls: string[]
}) {
  const { user, role } = useAuth()
  const router = useRouter()
  const [lightbox, setLightbox] = useState<string | null>(null)

  const initials = model.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const hasPhoto = model.photo_url && model.photo_url.trim() !== ''
  const isOwnProfile = user?.id === model.id

  const handleHire = () => {
    if (!user) { router.push('/login'); return }
    if (role === 'agency') router.push('/dashboard/agency')
    else router.push('/jobs')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link href="/models" className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors mb-8">
          ← Back to Models
        </Link>

        {/* Profile header */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#c9a84c]/20 via-[#8B6914]/10 to-transparent" />

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-5 w-28 h-28">
              <div className="w-28 h-28 rounded-2xl border-4 border-black overflow-hidden bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-3xl font-black text-black">
                {hasPhoto ? (
                  <img src={model.photo_url!} alt={model.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              {model.is_available && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-black" title="Available for bookings" />
              )}
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-playfair text-3xl font-bold mb-1">{model.name}</h1>
                {model.specialization && (
                  <div className="text-sm font-bold text-[#c9a84c] tracking-wider uppercase mb-3">{model.specialization}</div>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-white/45">
                  <span>📍 {model.city}</span>
                  {model.height && <span>📏 {model.height}</span>}
                  {model.age && <span>🎂 {model.age} years old</span>}
                  {model.experience_years ? <span>⭐ {model.experience_years} yrs experience</span> : null}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {isOwnProfile ? (
                  <Link href="/dashboard/model"
                    className="bg-white/5 border border-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:border-[#c9a84c]/40 transition-all">
                    ✏️ Edit Profile
                  </Link>
                ) : (
                  <>
                    <span className={`text-sm font-semibold px-4 py-2.5 rounded-xl border
                      ${model.is_available
                        ? 'text-green-400 bg-green-400/10 border-green-400/20'
                        : 'text-white/30 border-white/10'}`}>
                      {model.is_available ? '● Available' : '○ Not Available'}
                    </span>
                    {role === 'agency' && (
                      <button onClick={handleHire}
                        className="bg-[#c9a84c] text-black font-bold px-6 py-2.5 rounded-xl hover:bg-[#e8c97a] transition-all text-sm">
                        Post a Job for This Model
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* About */}
            {model.bio && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <h3 className="text-xs font-bold tracking-widest uppercase text-white/35 mb-3">About</h3>
                <p className="text-sm text-white/60 leading-relaxed">{model.bio}</p>
              </div>
            )}

            {/* Details */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white/35 mb-4">Details</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'City', value: model.city, icon: '📍' },
                  { label: 'Height', value: model.height, icon: '📏' },
                  { label: 'Age', value: model.age ? `${model.age} years` : null, icon: '🎂' },
                  { label: 'Experience', value: model.experience_years ? `${model.experience_years} years` : null, icon: '⭐' },
                  { label: 'Specialization', value: model.specialization, icon: '🎯' },
                ].filter(d => d.value).map(d => (
                  <div key={d.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/35">{d.icon} {d.label}</span>
                    <span className="text-xs font-semibold text-white/70">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact (only for agencies) */}
            {role === 'agency' && (
              <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-2xl p-5">
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c]/70 mb-4">Contact Info</h3>
                <div className="flex flex-col gap-3">
                  {(model as any).phone && (
                    <a href={`tel:${(model as any).phone}`}
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                      <span className="text-base">📞</span> {(model as any).phone}
                    </a>
                  )}
                  {(model as any).instagram && (
                    <a href={`https://instagram.com/${(model as any).instagram?.replace('@', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-[#c9a84c] transition-colors">
                      <span className="text-base">📸</span> {(model as any).instagram}
                    </a>
                  )}
                  {!(model as any).phone && !(model as any).instagram && (
                    <p className="text-xs text-white/30">No contact info provided yet.</p>
                  )}
                </div>
              </div>
            )}

            {!user && (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5 text-center">
                <p className="text-xs text-white/35 mb-3">Sign in as an agency to view contact details</p>
                <Link href="/login" className="text-xs font-bold text-[#c9a84c] hover:underline">Sign In →</Link>
              </div>
            )}

            {/* Tags */}
            {(model.tags || []).length > 0 && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <h3 className="text-xs font-bold tracking-widest uppercase text-white/35 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(model.tags || []).map((tag: string) => (
                    <span key={tag} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/55">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Portfolio grid */}
          <div className="md:col-span-2">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white/35 mb-5">
                Portfolio {portfolioUrls.length > 0 && <span className="text-white/20 ml-1">({portfolioUrls.length} photos)</span>}
              </h3>

              {portfolioUrls.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/8 rounded-xl">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-sm text-white/25">No portfolio photos yet.</p>
                  {isOwnProfile && (
                    <Link href="/dashboard/model" className="text-xs text-[#c9a84c] hover:underline mt-2 inline-block">
                      Upload photos from your dashboard →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolioUrls.map((url, i) => (
                    <div key={i}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#c9a84c] transition-all"
                      onClick={() => setLightbox(url)}>
                      <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-6 text-white/50 hover:text-white text-3xl transition-colors">×</button>
          <img src={lightbox} alt="Portfolio" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  )
}
