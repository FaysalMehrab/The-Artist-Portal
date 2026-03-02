'use client'

import { useState } from 'react'
import type { Model } from '@/types'
import { useAuth } from '@/lib/AuthContext'

const BD_DISTRICTS = [
  'Dhaka','Chittagong','Sylhet','Rajshahi','Khulna',
  'Barishal','Comilla','Gazipur','Narayanganj','Mymensingh',
  'Rangpur','Jessore','Bogra','Dinajpur','Tangail'
]

const SPECS = ['Commercial','Runway','Editorial','Fitness','Print','High Fashion','Bridal']

export default function ModelsClient({ models }: { models: Model[] }) {
  const { user, role } = useAuth()
  const [search, setSearch] = useState('')
  const [spec, setSpec] = useState('')
  const [city, setCity] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filtered = models.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.specialization?.toLowerCase().includes(q) || m.city.toLowerCase().includes(q)
    const matchSpec = !spec || m.specialization?.toLowerCase().includes(spec.toLowerCase())
    const matchCity = !city || m.city.toLowerCase() === city.toLowerCase()
    const matchAvail = !availableOnly || m.is_available
    return matchQ && matchSpec && matchCity && matchAvail
  })

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#c9a84c]/8 to-transparent border-b border-white/6 px-6 py-14 text-center">
        <p className="text-[11px] tracking-[3px] uppercase font-bold text-[#c9a84c] mb-3">✦ Talent Pool</p>
        <h1 className="font-playfair text-5xl font-bold mb-3">Find Models</h1>
        <p className="text-white/40 text-lg">Discover {models.length} verified models across Bangladesh</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-14 py-10">
        {/* Search + filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            className="flex-1 min-w-[240px] bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c9a84c]/40 transition-colors"
            placeholder="🔍  Search by name, specialization, district..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer min-w-[170px] focus:border-[#c9a84c]/40"
            value={spec} onChange={e => setSpec(e.target.value)}>
            <option value="" className="bg-[#1a1a1a]">All Specializations</option>
            {SPECS.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
          </select>
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer min-w-[160px] focus:border-[#c9a84c]/40"
            value={city} onChange={e => setCity(e.target.value)}>
            <option value="" className="bg-[#1a1a1a]">All Districts</option>
            {BD_DISTRICTS.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
          </select>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/35">
              <span className="text-white font-semibold">{filtered.length}</span> models found
            </p>
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                ${availableOnly ? 'bg-green-400/10 border-green-400/25 text-green-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${availableOnly ? 'bg-green-400' : 'bg-white/30'}`} />
              Available Only
            </button>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>
              ⊞ Grid
            </button>
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>
              ☰ List
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/35 text-lg mb-2">No models found</p>
            <p className="text-white/20 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(model => (
              <ModelGridCard key={model.id} model={model} isAgency={role === 'agency'} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(model => (
              <ModelListCard key={model.id} model={model} isAgency={role === 'agency'} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ModelGridCard({ model, isAgency }: { model: Model; isAgency: boolean }) {
  const initials = model.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="bg-white/[0.03] border border-white/7 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#c9a84c]/30 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-pointer group">
      {/* Photo / Avatar */}
      <div className="relative h-64 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center overflow-hidden">
        {model.photo_url ? (
          <img src={model.photo_url} alt={model.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-2xl font-black text-black">
            {initials}
          </div>
        )}
        {/* Availability badge */}
        <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm
          ${model.is_available
            ? 'bg-green-500/20 border-green-500/30 text-green-400'
            : 'bg-white/10 border-white/15 text-white/40'}`}>
          {model.is_available ? '● Available' : '○ Busy'}
        </div>
        {/* Instagram badge */}
        {(model as any).instagram && (
          <div className="absolute bottom-3 left-3 text-xs bg-black/60 backdrop-blur-sm border border-white/10 text-white/60 px-2.5 py-1 rounded-full">
            📸 {(model as any).instagram}
          </div>
        )}
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
        {isAgency && (
          <button className="mt-3 w-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c] text-xs font-bold py-2 rounded-lg hover:bg-[#c9a84c] hover:text-black transition-all">
            Contact Model
          </button>
        )}
      </div>
    </div>
  )
}

function ModelListCard({ model, isAgency }: { model: Model; isAgency: boolean }) {
  const initials = model.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="bg-white/[0.03] border border-white/7 rounded-2xl p-5 flex items-center gap-5 hover:border-[#c9a84c]/25 transition-all">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8B6914] flex items-center justify-center text-lg font-black text-black flex-shrink-0 overflow-hidden">
        {model.photo_url
          ? <img src={model.photo_url} alt={model.name} className="w-full h-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }} />
          : initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="font-bold text-base">{model.name}</span>
          {model.specialization && (
            <span className="text-xs text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-2.5 py-0.5 rounded-full">{model.specialization}</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full border ml-auto ${model.is_available ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-white/25 border-white/10'}`}>
            {model.is_available ? '● Available' : '○ Busy'}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-white/40">
          <span>📍 {model.city}</span>
          {model.height && <span>📏 {model.height}</span>}
          {model.age && <span>🎂 {model.age}</span>}
          {model.experience_years ? <span>⭐ {model.experience_years} yrs exp</span> : null}
        </div>
      </div>
      {isAgency && (
        <button className="bg-[#c9a84c] text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#e8c97a] transition-all flex-shrink-0">
          Contact
        </button>
      )}
    </div>
  )
}
