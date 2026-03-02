export interface Model {
  id: string
  name: string
  age: number | null
  city: string
  height: string | null
  specialization: string | null
  bio: string | null
  photo_url: string | null
  phone: string | null
  experience_years: number
  tags: string[]
  is_available: boolean
  created_at: string
}

export interface AgencyProfile {
  id: string
  agency_name: string
  contact_person: string | null
  city: string
  website: string | null
  description: string | null
  logo_url: string | null
  is_verified: boolean
  created_at: string
}

export interface Job {
  id: string
  agency_id: string
  title: string
  location: string
  pay: string | null
  description: string | null
  type: string
  gender_requirement: string
  age_range: string | null
  min_height: string | null
  experience_level: string
  shoot_date: string | null
  is_open: boolean
  created_at: string
  agency_profiles?: AgencyProfile
}

export interface Application {
  id: string
  job_id: string
  model_id: string
  message: string | null
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: string
  jobs?: Job
  models?: Model
}
