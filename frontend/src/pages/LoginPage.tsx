import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Message from ProtectedRoute if user tried to access workspace without auth
  const redirectMessage = (location.state as any)?.message;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login(email || (role === 'admin' ? 'admin@intentguard.sec' : 'analyst@intentguard.sec'), role, undefined, password || 'AdminPassword123!');
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-amber-500/20 selection:text-amber-400 bg-grid-pattern relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-purple-500/10 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Brand Link */}
      <Link to="/" className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <MaterialIcon name="shield" className="text-amber-500 text-2xl icon-fill" />
        </div>
        <span className="font-heading text-2xl font-bold tracking-tight text-white">IntentShield CTI</span>
      </Link>

      {/* Sign In Card */}
      <div className="w-full max-w-md glass-panel p-8 space-y-6 border-white/10 relative z-10 shadow-2xl">
        {redirectMessage && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl font-mono text-xs text-amber-400 font-bold text-center">
            {redirectMessage}
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-bold text-white">Sign In to Your Account</h1>
          <p className="font-body text-xs text-slate-400">
            Access analyst workspace, threat intelligence, and CTI reports
          </p>
        </div>

        {/* Role Selector Tabs */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1.5">Email / Username:</label>
            <input
              type="email"
              required
              placeholder={role === 'admin' ? 'admin@intentguard.sec' : 'analyst@intentguard.sec'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-300 font-bold block">Password:</label>
              <a href="#forgot" className="text-[11px] text-amber-400 hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-xs">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-amber-500 rounded cursor-pointer"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full btn-primary text-sm py-3 font-heading font-bold shadow-glow mt-2"
          >
            <MaterialIcon name="arrow_forward" className="text-base" />
            Sign In as {role === 'admin' ? 'Admin' : 'Analyst'}
          </button>
        </form>

        {/* Footer link to Register */}
        <div className="text-center pt-2 border-t border-white/10 font-mono text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-amber-400 font-bold hover:underline">
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
