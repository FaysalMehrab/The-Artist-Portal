import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AgencyProfileClient from './AgencyProfileClient'

export const revalidate = 0

export default async function AgencyProfilePage({ params }: { params: { id: string } }) {
  const { data: agency } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!agency) notFound()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('agency_id', params.id)
    .eq('is_open', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return <AgencyProfileClient agency={agency} jobs={jobs || []} />
}
