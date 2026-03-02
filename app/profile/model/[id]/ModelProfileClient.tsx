'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import type { Model } from '@/types'

export default function ModelProfileClient({ model }: { model: Model }) {
  const { user, role } = useAuth()
  const hasPhoto = model.photo_url && model.photo_url.trim() !== ''
  const initials = model.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const portfolio: string[] = (model as any).portfolio_urls || []

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero banner */}
      <div className="relative h-48 bg-gradient-to-r from-[#c9a84c]/15 via-[#1a1a1a] to-black border-b border-white/6">
        <div className="absolute inset-0 hero-grid opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10">
        {/* Profile header — overlaps banner */}
        <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 mb-10">
          {/* Avatar */}
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-black overflow-hidden bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center flex-shrink-0 shadow-2xl">
            {hasPhoto ? (
              <img src={model.photo_url!} alt={model.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-black">{initials}</span>
            )}
          </div>

          {/* Name + info */}
          <div className="flex-1 pt-2 md:pt-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-playfair text-3xl font-bold mb-1">{model.name}</h1>
                {model.specialization && (
                  <p className="text-[#c9a84c] text-sm font-bold tracking-wider uppercase">{model.specialization}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  model.is_available
                    ? 'text-green-400 bg-green-400/10 border-green-400/25'
                    : 'text-white/30 bg-white/5 border-white/10'
                }`}>
                  {model.is_available ? '● Available for Bookings' : '○ Currently Busy'}
                </span>
                {role === 'agency' && (
                  <Link href="/dashboard/agency"
                    className="text-xs font-bold bg-[#c9a84c] text-black px-4 py-1.5 rounded-full hover:bg-[#e8c97a] transition-all">
                    Contact via Dashboard
                  </Link>
                )}
                {!user && (
                  <Link href="/register"
                    className="text-xs font-bold bg-[#c9a84c] text-black px-4 py-1.5 rounded-full hover:bg-[#e8c97a] transition-all">
                    Sign Up to Contact
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: stats + info */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {/* Quick stats */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
              <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-4">Profile Details</p>
              <div className="flex flex-col gap-3">
                {model.city && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">📍 Location</span>
                    <span className="font-medium">{model.city}, BD</span>
                  </div>
                )}
                {model.age && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">🎂 Age</span>
                    <span className="font-medium">{model.age} years</span>
                  </div>
                )}
                {model.height && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">📏 Height</span>
                    <span className="font-medium">{model.height}</span>
                  </div>
                )}
                {model.experience_years !== undefined && model.experience_years > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">⭐ Experience</span>
                    <span className="font-medium">{model.experience_years} years</span>
                  </div>
                )}
                {(model as any).instagram && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">📸 Instagram</span>
                    <span className="font-medium text-[#c9a84c]">{(model as any).instagram}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {model.tags && model.tags.length > 0 && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-3">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag: string) => (
                    <span key={tag} className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs rounded-full px-3 py-1 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA for agencies */}
            {!user && (
              <div className="bg-gradient-to-br from-[#c9a84c]/10 to-transparent border border-[#c9a84c]/20 rounded-2xl p-5 text-center">
                <p className="text-sm font-semibold mb-1">Interested in working with {model.name.split(' ')[0]}?</p>
                <p className="text-xs text-white/40 mb-4">Create a free agency account to post jobs and contact models.</p>
                <Link href="/register"
                  className="block w-full bg-[#c9a84c] text-black font-bold py-2.5 rounded-xl text-sm hover:bg-[#e8c97a] transition-all">
                  Create Agency Account
                </Link>
              </div>
            )}
          </div>

          {/* Right: bio + portfolio */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Bio */}
            {model.bio && model.bio.trim() && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-3">About</p>
                <p className="text-sm text-white/70 leading-relaxed">{model.bio}</p>
              </div>
            )}

            {/* Portfolio gallery */}
            {portfolio.length > 0 ? (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <p className="text-[11px] tracking-[2px] uppercase font-bold text-[#c9a84c] mb-4">Portfolio</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {portfolio.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/8">
                      <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-3">📷</p>
                <p className="text-sm text-white/30">No portfolio photos yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Back nav */}
        <div className="mt-10">
          <Link href="/models" className="text-sm text-white/35 hover:text-[#c9a84c] transition-colors">
            ← Back to all models
          </Link>
        </div>
      </div>
    </div>
  )
}
