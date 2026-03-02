'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface PhotoUploadProps {
  userId: string
  currentUrl: string | null
  bucket: 'avatars' | 'portfolios'
  onUpload: (url: string) => void
  label?: string
  shape?: 'square' | 'circle'
}

export default function PhotoUpload({ userId, currentUrl, bucket, onUpload, label = 'Upload Photo', shape = 'square' }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }
    setError('')

    // Local preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
        setError('Storage not set up yet. Please create the "' + bucket + '" bucket in Supabase → Storage, then try again.')
      } else {
        setError('Upload failed: ' + uploadError.message)
      }
      setUploading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
    onUpload(urlData.publicUrl)
    setUploading(false)
  }

  const hasPhoto = preview && preview.trim() !== ''
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative w-28 h-28 bg-gradient-to-br from-[#1a1a1a] to-[#111] border-2 border-dashed border-white/15 ${shapeClass} overflow-hidden cursor-pointer hover:border-[#c9a84c]/40 transition-all group`}
        onClick={() => inputRef.current?.click()}>
        {hasPhoto ? (
          <>
            <img src={preview!} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">Change</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <div className="text-2xl text-white/20 group-hover:text-[#c9a84c]/60 transition-colors">+</div>
            <div className="text-xs text-white/20 group-hover:text-white/40 transition-colors text-center px-2">{label}</div>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <button type="button" onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-[#c9a84c] border border-[#c9a84c]/25 px-4 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition-all">
        {uploading ? 'Uploading...' : hasPhoto ? 'Change Photo' : label}
      </button>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}