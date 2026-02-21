import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

export default function KPICard({ title, value, suffix = '', icon: Icon, color = 'accent', delay = 0 }) {
  const colorMap = {
    accent: { bg: 'from-blue-500/20 to-blue-600/5', icon: 'text-blue-400 bg-blue-500/15', border: 'border-blue-500/20' },
    success: { bg: 'from-emerald-500/20 to-emerald-600/5', icon: 'text-emerald-400 bg-emerald-500/15', border: 'border-emerald-500/20' },
    warning: { bg: 'from-amber-500/20 to-amber-600/5', icon: 'text-amber-400 bg-amber-500/15', border: 'border-amber-500/20' },
    danger: { bg: 'from-red-500/20 to-red-600/5', icon: 'text-red-400 bg-red-500/15', border: 'border-red-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-600/5', icon: 'text-purple-400 bg-purple-500/15', border: 'border-purple-500/20' },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} bg-navy-800/60 backdrop-blur-xl border ${c.border} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              <AnimatedCounter value={typeof value === 'number' ? value : 0} />
            </span>
            {suffix && <span className="text-sm text-slate-400 font-medium">{suffix}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${c.icon} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {/* Decorative glow */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
