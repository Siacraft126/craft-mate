import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function FileUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file))
      }

      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('craftmate-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('craftmate-files')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      if (onUploadSuccess) {
        onUploadSuccess(publicUrl)
      }

      alert('Fails veiksmīgi saglabāts mākonī!')
    } catch (error) {
      alert('Kļūda augšupielādējot: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '16px', border: '1px solid #334155', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', maxWidth: '400px', margin: '10px 0' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
        Pievienot dokumentu vai foto
      </label>

      {preview && (
        <div style={{ width: '100%', height: '180px', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
          <img src={preview} alt="Priekšskatījums" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'block', width: '100%', fontSize: '14px', color: '#94a3b8' }}
      />

      {uploading && (
        <p style={{ fontSize: '12px', color: '#facc15', marginTop: '8px' }}>
          Notiek faila augšupielāde uz Supabase...
        </p>
      )}
    </div>
  )
}
