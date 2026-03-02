import { supabase } from '@/lib/supabase'
import ModelsClient from './ModelsClient'

export const revalidate = 0

export default async function ModelsPage() {
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('created_at', { ascending: false })
  return <ModelsClient models={models || []} />
}
