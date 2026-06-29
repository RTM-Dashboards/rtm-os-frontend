import { redirect } from 'next/navigation'
export default function SalesIntakePage() {
  redirect('/sales/proposals?new=true')
}
