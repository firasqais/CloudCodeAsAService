import { Suspense } from 'react'
import ListingsContent from './ListingsContent'
import { Loader2 } from 'lucide-react'

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-nepal-red" />
      </div>
    }>
      <ListingsContent />
    </Suspense>
  )
}
