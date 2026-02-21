import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ShieldAlert, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'dispatcher' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.role);
        toast.success('Account created!');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-accent/30 rounded-full animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center shadow-glow-lg mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">FleetFlow</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isRegister ? 'Create your account' : 'Sign in to your command center'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-3 text-center uppercase tracking-widest">Select Your Command Center</label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'manager', label: 'Manager', icon: User },
                  { id: 'dispatcher', label: 'Dispatch', icon: Zap },
                  { id: 'safety_officer', label: 'Safety', icon: ShieldAlert },
                  { id: 'financial_analyst', label: 'Finance', icon: DollarSign }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.id })}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-500 border-2 ${form.role === r.id
                      ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                      : 'bg-navy-900/50 border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                  >
                    <r.icon className={`w-5 h-5 transition-transform duration-500 ${form.role === r.id ? 'text-accent scale-110' : 'group-hover:scale-110'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${form.role === r.id ? 'text-white' : ''}`}>{r.label}</span>
                    {form.role === r.id && (
                      <motion.div layoutId="role-active" className="absolute inset-0 bg-accent/5 rounded-[14px] pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            {isRegister && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-glass pl-10"
                    placeholder="John Doe"
                    required={isRegister}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-glass pl-10"
                  placeholder="admin@fleetflow.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-glass pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full btn-glow py-3 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-accent hover:text-accent-light transition-colors font-medium"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>

          {/* Demo credentials hint */}
          {!isRegister && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/10"
            >
              <p className="text-xs text-slate-500 text-center">
                Demo: <span className="text-accent">admin@fleetflow.com</span> / <span className="text-accent">admin123</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
