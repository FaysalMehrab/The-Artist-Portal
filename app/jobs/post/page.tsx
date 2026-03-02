import { redirect } from 'next/navigation'

// Job posting is now done from the Agency Dashboard
export default function PostJobRedirect() {
  redirect('/dashboard/agency')
}
