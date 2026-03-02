'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface PortfolioUploadProps {
  userId: string
  existingUrls: string[]
  onUpdate: (urls: string[]) => void
}

export default function PortfolioUpload({ userId, existingUrls, onUpdate }: PortfolioUploadProps) {
  const [urls, setUrls] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const oversized = files.filter(f => f.size > 5 * 1024 * 1024)
    if (oversized.length > 0) { setError('Each image must be under 5MB.'); return }
    if (urls.length + files.length > 8) { setError('Maximum 8 portfolio photos allowed.'); return }

    setError('')
    setUploading(true)

    const newUrls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const fileName = `${userId}/portfolio_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, file, { upsert: false })
      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          setError('Storage not set up. Please create the "portfolios" bucket in Supabase → Storage.')
        } else {
          setError('Upload failed: ' + uploadError.message)
        }
        continue
      }
      const { data: urlData } = supabase.storage.from('portfolios').getPublicUrl(fileName)
      newUrls.push(urlData.publicUrl)
    }

    const updated = [...urls, ...newUrls]
    setUrls(updated)
    onUpdate(updated)
    setUploading(false)
    // Reset input
    if (inputRef.current) inputRef.current.value = ''
  }

  const removePhoto = async (urlToRemove: string) => {
    const updated = urls.filter(u => u !== urlToRemove)
    setUrls(updated)
    onUpdate(updated)
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
        {urls.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] group">
            <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
              ×
            </button>
          </div>
        ))}

        {/* Add photo tile */}
        {urls.length < 8 && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-[#c9a84c]/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-xl text-white/20 group-hover:text-[#c9a84c]/60 transition-colors">+</span>
                <span className="text-[10px] text-white/20 group-hover:text-white/40">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => inputRef.current?.click()}
          disabled={uploading || urls.length >= 8}
          className="text-xs font-semibold text-[#c9a84c] border border-[#c9a84c]/25 px-4 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {uploading ? 'Uploading...' : '+ Add Portfolio Photos'}
        </button>
        <span className="text-xs text-white/20">{urls.length}/8 photos</span>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}