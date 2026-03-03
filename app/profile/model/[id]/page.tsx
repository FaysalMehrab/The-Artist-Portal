import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProfileClientModel from './ProfileClientModel'

export const revalidate = 0

export default async function ModelProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: model } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single()

  if (!model) notFound()

  return <ProfileClientModel model={model} />
}