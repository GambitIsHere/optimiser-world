import { cn } from '../../utils'

const statusConfig = {
  connected: { dot: 'bg-mint', text: 'text-mint', label: 'Connected' },
  not_connected: { dot: 'bg-white/20', text: 'text-white/40', label: 'Not connected' },
  available: { dot: 'bg-white/20', text: 'text-white/40', label: 'Available' },
  running: { dot: 'bg-blue', text: 'text-blue', label: 'Running' },
  merged: { dot: 'bg-mint', text: 'text-mint', label: 'Merged' },
  open: { dot: 'bg-amber', text: 'text-amber', label: 'Open' },
  draft: { dot: 'bg-white/30', text: 'text-white/40', label: 'Draft' },
  passed: { dot: 'bg-mint', text: 'text-mint', label: 'Passed' },
  success: { dot: 'bg-mint', text: 'text-mint', label: 'Passed' },
  completed: { dot: 'bg-mint', text: 'text-mint', label: 'Completed' },
  failed: { dot: 'bg-red', text: 'text-red', label: 'Failed' },
  active: { dot: 'bg-mint', text: 'text-mint', label: 'Active' },
  in_progress: { dot: 'bg-blue', text: 'text-blue', label: 'In Progress' },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.open
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
