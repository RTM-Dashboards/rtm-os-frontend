import { redirect } from 'next/navigation'
export default function GoalSelectionPage() {
  redirect('/sales/proposals?new=true')
}
