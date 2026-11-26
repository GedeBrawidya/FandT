import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 text-center max-w-sm w-full flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          {icon ?? <Clock size={32} className="text-emerald-400" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-50">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          )}
        </div>
        <Badge variant="success">Segera hadir</Badge>
      </div>
    </div>
  )
}
