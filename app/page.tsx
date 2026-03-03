import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import StatsCounter from '@/components/ui/StatsCounter'
import ModelCard from '@/components/ui/ModelCard'

export const revalidate = 0

export default async function HomePage() {
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { count: modelCount } = await supabase.from('models').select('*', { count: 'exact', head: true })
  const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_open', true)

  const featuredModels = models || []

  return (
    <>
      {/* ─── HERO ─────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full px-4 py-1.5 text-xs font-bold text-[#c9a84c] tracking-widest uppercase mb-7">
            <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full pulse-dot" />
            Made for Bangladesh
          </div>
          <h1 className="font-playfair text-5xl md:text-7xl lg:text-[88px] font-black leading-[1.05] tracking-[-2px] mb-6">
            Where <span className="text-[#c9a84c]">Talent</span><br />Meets Opportunity
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto mb-11">
            Bangladesh's premier platform connecting models with agencies and brands. Find work, post jobs, and grow your career.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"
              className="bg-[#c9a84c] text-black font-bold text-base px-9 py-4 rounded-xl hover:bg-[#e8c97a] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(201,168,76,0.35)] transition-all">
              Join as a Model
            </Link>
            <Link href="/jobs"
              className="border border-white/20 text-white font-semibold text-base px-9 py-4 rounded-xl hover:border-white/50 hover:bg-white/5 transition-all">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────── */}
      <div className="border-y border-white/7 bg-white/[0.02]">
        <StatsCounter stats={[
          { label: 'Models Registered', value: modelCount || 0 },
          { label: 'Active Jobs', value: jobCount || 0 },
          { label: 'Cities Covered', value: 7 },
          { label: 'Happy Clients', value: 120 },
        ]} />
      </div>

      {/* ─── FEATURED MODELS ───────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-14 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <p className="text-[11px] tracking-[3px] uppercase font-bold text-[#c9a84c] mb-2">✦ Available Talent</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold">Featured Models</h2>
            <p className="text-white/40 text-base mt-3">Discover talented models across Bangladesh.</p>
          </div>
          <Link href="/models"
            className="text-sm font-medium text-white/60 border border-white/15 px-5 py-2.5 rounded-lg hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
            View All →
          </Link>
        </div>

        {featuredModels.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-white/35 mb-2">No models yet — be the first!</p>
            <Link href="/register" className="text-sm text-[#c9a84c] hover:underline">Create a model profile →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredModels.map(model => <ModelCard key={model.id} model={model} />)}
          </div>
        )}
      </section>

      {/* ─── HOW IT WORKS ──────────────────── */}
      <div className="bg-white/[0.015] border-y border-white/6">
        <div className="max-w-5xl mx-auto px-6 md:px-14 py-24">
          <div className="text-center mb-14">
            <p className="text-[11px] tracking-[3px] uppercase font-bold text-[#c9a84c] mb-2">✦ The Process</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold">How The Artist Portal Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Create Account', desc: 'Models build their profile. Agencies register their brand and get verified.' },
              { num: '2', title: 'Post or Apply', desc: 'Agencies post jobs with details and pay rate. Models browse and apply instantly.' },
              { num: '3', title: 'Connect', desc: 'Agencies review applicants and accept the perfect model for their project.' },
              { num: '4', title: 'Get Booked', desc: 'Models get confirmed bookings directly. Build your career one gig at a time.' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 mx-auto mb-5 bg-gradient-to-br from-[#c9a84c] to-[#8B6914] rounded-2xl flex items-center justify-center text-xl font-black text-black">
                  {step.num}
                </div>
                <div className="font-bold text-base mb-2">{step.title}</div>
                <div className="text-sm text-white/40 leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FEATURES ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-14 py-24">
        <div className="text-center mb-14">
          <p className="text-[11px] tracking-[3px] uppercase font-bold text-[#c9a84c] mb-2">✦ Why The Artist Portal</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold">Everything You Need</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🪪', title: 'Verified Profiles', desc: 'Every model profile is real and linked to a verified account. No fake listings.' },
            { icon: '📋', title: 'Easy Applications', desc: 'Apply to jobs in seconds with your profile. Track all your applications in one place.' },
            { icon: '🏢', title: 'Agency Dashboard', desc: 'Agencies manage all job postings and review applicants from a single dashboard.' },
            { icon: '💬', title: 'Direct Contact', desc: 'Agency contact details visible on accepted applications for seamless coordination.' },
            { icon: '💰', title: 'Taka-First Pay', desc: 'All pay rates displayed in ৳ BDT. Clear, honest rates from day one.' },
            { icon: '📍', title: 'Bangladesh-Wide', desc: 'Models and agencies from Dhaka, Chittagong, Sylhet, Rajshahi and more.' },
          ].map(f => (
            <div key={f.title} className="bg-white/[0.02] border border-white/7 rounded-2xl p-8 hover:border-[#c9a84c]/25 hover:bg-[#c9a84c]/[0.03] transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <div className="font-bold text-base mb-2.5">{f.title}</div>
              <div className="text-sm text-white/40 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-14 pb-24">
        <div className="bg-gradient-to-r from-[#c9a84c]/10 to-transparent border border-[#c9a84c]/20 rounded-3xl p-12 text-center">
          <h2 className="font-playfair text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/45 mb-8 text-lg">Join Bangladesh's growing community of models and agencies.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="bg-[#c9a84c] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#e8c97a] transition-all">
              Create Free Account
            </Link>
            <Link href="/login" className="border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:border-white/50 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────── */}
      <footer className="border-t border-white/6 bg-white/[0.02] px-6 md:px-14 py-10 flex flex-wrap items-center justify-between gap-5">
        <div className="font-playfair text-xl font-bold">The Artist <span className="text-[#c9a84c]">Portal</span> <span className="text-xs font-normal text-white/20">Bangladesh</span></div>
        <p className="text-xs text-white/25">© 2026 The Artist Portal. All rights reserved.</p>
        <div className="flex gap-5 text-xs text-white/30">
          <span className="hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-white/60 cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-white/60 cursor-pointer transition-colors">Support</span>
        </div>
      </footer>
    </>
  )
}
