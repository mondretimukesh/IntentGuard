import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Message from ProtectedRoute if user tried to access workspace without signing up
  const redirectMessage = (location.state as any)?.message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    register(fullName || 'Security Analyst', email, role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-amber-500/20 selection:text-amber-400 bg-grid-pattern relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-purple-500/10 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Brand Link */}
      <Link to="/" className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <MaterialIcon name="shield" className="text-amber-500 text-2xl icon-fill" />
        </div>
        <span className="font-heading text-2xl font-bold tracking-tight text-white">IntentShield CTI</span>
      </Link>

      {/* Sign Up Card */}
      <div className="w-full max-w-lg glass-panel p-8 space-y-6 border-white/10 relative z-10 shadow-2xl">
        {redirectMessage && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl font-mono text-xs text-amber-400 font-bold text-center">
            {redirectMessage}
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-bold text-white">Create Your Account</h1>
          <p className="font-body text-xs text-slate-400">
            Register for access to automated APK threat intelligence and security analysis
          </p>
        </div>

        {/* Account Role Selector */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="text-slate-400 uppercase font-bold block text-[11px]">Select Account Role:</label>
          <div className="grid grid-cols-2 gap-2 bg-[#07090E] p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 px-3 rounded-lg font-heading text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'user'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MaterialIcon name="account_circle" className="text-sm" />
              Standard User / Analyst
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 px-3 rounded-lg font-heading text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MaterialIcon name="shield_lock" className="text-sm" />
              Administrator (Admin)
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Full Name:</label>
              <input
                type="text"
                required
                placeholder="Bharath"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Email Address:</label>
              <input
                type="email"
                required
                placeholder="bharath@intentguard.sec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Password:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Confirm Password:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-xs">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-amber-500 rounded cursor-pointer"
              />
              I agree to the CTI Platform Security & Privacy Terms
            </label>
          </div>

          <button
            type="submit"
            className="w-full btn-primary text-sm py-3 font-heading font-bold shadow-glow mt-2"
          >
            <MaterialIcon name="add" className="text-base" />
            Create {role === 'admin' ? 'Admin' : 'User'} Account
          </button>
        </form>

        {/* Footer link to Login */}
        <div className="text-center pt-2 border-t border-white/10 font-mono text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
