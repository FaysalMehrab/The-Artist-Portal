'use client'

import Link from 'next/link'
import type { Model } from '@/types'

export default function ModelCard({ model }: { model: Model }) {
  const initials = model.name
    ? model.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const hasPhoto = !!(model.photo_url && model.photo_url.trim() !== '')

  return (
    <Link href={`/profile/model/${model.id}`}>
      <div className="bg-white/[0.03] border border-white/7 rounded-2xl overflow-hidden card-hover hover:border-[#c9a84c]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] cursor-pointer group">
        {/* Photo or Avatar */}
        <div className="relative h-72 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center overflow-hidden">
          {hasPhoto ? (
            <img
              src={model.photo_url!}
              alt={model.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  const div = document.createElement('div')
                  div.className = 'w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-2xl font-black text-black absolute'
                  div.textContent = initials
                  parent.appendChild(div)
                }
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-3xl font-black text-black select-none">
              {initials}
            </div>
          )}

          {/* Availability badge */}
          <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm
            ${model.is_available
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : 'bg-black/50 border-white/10 text-white/35'}`}>
            {model.is_available ? '● Available' : '○ Busy'}
          </div>

          {/* View profile overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <span className="text-xs font-bold text-white bg-[#c9a84c] px-4 py-1.5 rounded-full">View Profile</span>
          </div>
        </div>

        <div className="p-4">
          <div className="font-bold text-base mb-0.5">{model.name}</div>
          {model.specialization && (
            <div className="text-xs font-bold text-[#c9a84c] tracking-wider uppercase mb-2">{model.specialization}</div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40 mb-3">
            <span>📍 {model.city}</span>
            {model.height && <span>📏 {model.height}</span>}
            {model.age && <span>🎂 {model.age} yrs</span>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(model.tags || []).slice(0, 3).map((tag: string) => (
              <span key={tag} className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-xs text-white/45">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
