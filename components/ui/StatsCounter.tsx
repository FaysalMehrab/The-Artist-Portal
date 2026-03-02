'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat { label: string; value: number }

export default function StatsCounter({ stats }: { stats: Stat[] }) {
  const [counts, setCounts] = useState(stats.map(() => 0))
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true
        stats.forEach((stat, i) => {
          let cur = 0
          const step = Math.ceil(stat.value / 60)
          const timer = setInterval(() => {
            cur = Math.min(cur + step, stat.value)
            setCounts(prev => { const n = [...prev]; n[i] = cur; return n })
            if (cur >= stat.value) clearInterval(timer)
          }, 20)
        })
      }
    }, { threshold: 0.3 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [stats])

  return (
    <div ref={ref} className="flex flex-wrap justify-center">
      {stats.map((stat, i) => (
        <div key={stat.label}
          className="flex-1 min-w-[160px] px-10 py-8 text-center border-r border-white/7 last:border-r-0">
          <div className="font-playfair text-4xl font-bold text-[#c9a84c]">
            {counts[i].toLocaleString()}+
          </div>
          <div className="text-xs text-white/35 mt-1.5 tracking-wider uppercase">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
