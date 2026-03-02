import { supabase } from '@/lib/supabase'
import JobsClient from './JobsClient'

export const revalidate = 0

export default async function JobsPage() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, agency_profiles(agency_name, city)')
    .eq('is_open', true)
    .order('created_at', { ascending: false })

  return <JobsClient jobs={jobs || []} />
}
