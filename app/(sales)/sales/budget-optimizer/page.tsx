import { redirect } from 'next/navigation'
export default function BudgetOptimizerPage() {
  redirect('/sales/proposals?new=true')
}
