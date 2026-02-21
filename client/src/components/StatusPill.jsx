const statusConfig = {
  available:  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Available' },
  on_duty:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'On Duty' },
  on_trip:    { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400', label: 'On Trip' },
  in_transit: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400', label: 'In Transit' },
  in_shop:    { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400', label: 'In Shop' },
  off_duty:   { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Off Duty' },
  retired:    { bg: 'bg-slate-500/15', text: 'text-slate-500', dot: 'bg-slate-500', label: 'Retired' },
  draft:      { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Draft' },
  dispatched: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Dispatched' },
  completed:  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Completed' },
  cancelled:  { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400', label: 'Cancelled' },
  pending:    { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Pending' },
  resolved:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Resolved' },
};

export default function StatusPill({ status, className = '' }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${['on_trip', 'dispatched', 'in_transit'].includes(status) ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
