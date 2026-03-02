'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import type { Model } from '@/types'

export default function ProfileClientModel({ model }: { model: Model }) {
  const { user, role } = useAuth()
  const hasPhoto = !!(model.photo_url && model.photo_url.trim() !== '')
  const initials = model.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const portfolioUrls: string[] = (model as any).portfolio_urls || []

  return (
    <div className="min-h-screen pt-20">
      {/* Hero banner */}
      <div className="relative h-64 bg-gradient-to-br from-[#1a1008] via-[#0d0d0d] to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c9a84c]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 -mt-20 relative z-10 pb-20">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-2xl border-4 border-black bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xl">
            {hasPhoto ? (
              <img src={model.photo_url!} alt={model.name} className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-3xl font-black text-black">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="font-playfair text-3xl md:text-4xl font-bold">{model.name}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${model.is_available ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                {model.is_available ? '● Available' : '○ Unavailable'}
              </span>
            </div>
            {model.specialization && (
              <p className="text-[#c9a84c] font-bold tracking-wider uppercase text-sm mb-2">{model.specialization}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-white/45">
              <span>📍 {model.city}, Bangladesh</span>
              {model.height && <span>📏 {model.height}</span>}
              {model.age && <span>🎂 {model.age} years</span>}
              {model.experience_years ? <span>🏅 {model.experience_years} yr{model.experience_years !== 1 ? 's' : ''} exp</span> : null}
            </div>
          </div>

          {/* Action for agencies */}
          {role === 'agency' && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/jobs"
                className="bg-[#c9a84c] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#e8c97a] transition-all text-sm text-center">
                Post a Job
              </Link>
              {model.phone && (
                <a href={`tel:${model.phone}`}
                  className="border border-white/15 text-white/60 font-semibold px-5 py-2.5 rounded-xl hover:border-[#c9a84c]/40 hover:text-white transition-all text-sm text-center">
                  📞 Contact
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Bio */}
            {model.bio && (
              <div className="bg-white/[0.03] border border-white/7 rounded-2xl p-6">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-3">About</h2>
                <p className="text-white/60 leading-relaxed text-sm">{model.bio}</p>
              </div>
            )}

            {/* Portfolio photos */}
            <div className="bg-white/[0.03] border border-white/7 rounded-2xl p-6">
              <h2 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-4">Portfolio</h2>
              {portfolioUrls.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl h-40 flex items-center justify-center">
                  <p className="text-white/20 text-sm">No portfolio photos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolioUrls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] group cursor-pointer">
                      <img src={url} alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.parentElement!.style.display = 'none' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right col - stats & contact */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="bg-white/[0.03] border border-white/7 rounded-2xl p-5">
              <h2 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-4">Details</h2>
              <div className="flex flex-col gap-3 text-sm">
                {model.city && (
                  <div className="flex justify-between">
                    <span className="text-white/35">Location</span>
                    <span className="font-medium">{model.city}</span>
                  </div>
                )}
                {model.height && (
                  <div className="flex justify-between">
                    <span className="text-white/35">Height</span>
                    <span className="font-medium">{model.height}</span>
                  </div>
                )}
                {model.age && (
                  <div className="flex justify-between">
                    <span className="text-white/35">Age</span>
                    <span className="font-medium">{model.age}</span>
                  </div>
                )}
                {model.experience_years !== undefined && model.experience_years > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/35">Experience</span>
                    <span className="font-medium">{model.experience_years} years</span>
                  </div>
                )}
                {model.specialization && (
                  <div className="flex justify-between">
                    <span className="text-white/35">Specialty</span>
                    <span className="font-medium text-[#c9a84c]">{model.specialization}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {model.tags && model.tags.length > 0 && (
              <div className="bg-white/[0.03] border border-white/7 rounded-2xl p-5">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag: string) => (
                    <span key={tag} className="bg-white/5 border border-white/10 text-white/50 text-xs px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Social */}
            {(model as any).instagram && (
              <div className="bg-white/[0.03] border border-white/7 rounded-2xl p-5">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-3">Social</h2>
                <a href={`https://instagram.com/${(model as any).instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                  📸 {(model as any).instagram}
                </a>
              </div>
            )}

            {/* Contact (agency only or logged in) */}
            {(role === 'agency') && model.phone && (
              <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-2xl p-5">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-3">Contact</h2>
                <p className="text-sm font-semibold">{model.phone}</p>
                <p className="text-xs text-white/30 mt-1">Phone / WhatsApp</p>
              </div>
            )}

            {!user && (
              <div className="bg-white/[0.02] border border-white/7 rounded-2xl p-5 text-center">
                <p className="text-xs text-white/35 mb-3">Sign in to contact this model</p>
                <Link href="/login" className="text-xs font-bold text-[#c9a84c] hover:underline">Sign In →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href="/models" className="text-sm text-white/30 hover:text-[#c9a84c] transition-colors">
            ← Back to All Models
          </Link>
        </div>
      </div>
    </div>
  )
}
