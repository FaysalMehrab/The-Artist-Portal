import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ModelProfileClient from './ModelProfileClient'

export default async function ModelProfilePage({ params }: { params: { id: string } }) {
  const { data: model } = await supabase
    .from('models')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!model) notFound()

  // Fetch portfolio images
  const { data: portfolioFiles } = await supabase.storage
    .from('portfolios')
    .list(params.id, { limit: 20 })

  const portfolioUrls = (portfolioFiles || [])
    .filter(f => f.name !== '.emptyFolderPlaceholder')
    .map(f => supabase.storage.from('portfolios').getPublicUrl(`${params.id}/${f.name}`).data.publicUrl)

  return <ModelProfileClient model={model} portfolioUrls={portfolioUrls} />
}
