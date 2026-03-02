import { supabase } from './supabase'
import type { Model, Job, Application } from '@/types'

// ─── MODELS ──────────────────────────────────

export async function getModels(): Promise<Model[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error('getModels error:', error); return [] }
  return data ?? []
}

export async function getModelById(id: string): Promise<Model | null> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single()

  if (error) { console.error('getModelById error:', error); return null }
  return data
}

// ─── JOBS ────────────────────────────────────

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error('getJobs error:', error); return [] }
  return data ?? []
}

export async function createJob(job: Omit<Job, 'id' | 'created_at'>): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .insert([job])
    .select()
    .single()

  if (error) { console.error('createJob error:', error); return null }
  return data
}

// ─── APPLICATIONS ────────────────────────────

export async function createApplication(
  app: Omit<Application, 'id' | 'created_at' | 'status' | 'job'>
): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .insert([{ ...app, status: 'pending' }])
    .select()
    .single()

  if (error) { console.error('createApplication error:', error); return null }
  return data
}

export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) { console.error('getApplicationsByJob error:', error); return [] }
  return data ?? []
}
