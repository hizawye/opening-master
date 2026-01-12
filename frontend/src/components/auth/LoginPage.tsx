import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex items-center justify-center p-6 min-h-screen">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl">

          {/* Left side - Hero content (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="badge badge-primary badge-lg self-start gap-2"
            >
              <Zap className="w-5 h-5" fill="currentColor" />
              <span>AI-Powered Training</span>
            </motion.div>

            {/* Main heading */}
            <div className="flex flex-col gap-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="font-display text-7xl font-black leading-[0.9] tracking-tight"
              >
                <span className="text-white">DOMINATE</span>
                <br />
                <span className="text-primary">FROM</span>
                <br />
                <span className="text-white">MOVE ONE</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="font-body text-xl text-white/70 leading-relaxed max-w-lg"
              >
                Master your opening repertoire with AI-powered analysis.
                Train like a grandmaster. Win like a champion.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center gap-10"
            >
              <div>
                <div className="font-display text-5xl font-black text-primary">
                  10K+
                </div>
                <div className="font-display text-sm text-white/60 uppercase tracking-wider">
                  Active Players
                </div>
              </div>

              <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

              <div>
                <div className="font-display text-5xl font-black text-primary">
                  50K+
                </div>
                <div className="font-display text-sm text-white/60 uppercase tracking-wider">
                  Games Analyzed
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="card bg-[#1a1a2e]/90 shadow-2xl border border-primary/20 backdrop-blur-xl">
              <div className="card-body p-8">
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                    <Crown className="w-7 h-7 text-base-100" />
                  </div>
                  <span className="font-display text-3xl font-black text-white uppercase">
                    Openings
                  </span>
                </div>

                <div className="mb-10">
                  <h2 className="font-display text-3xl font-bold text-white mb-2">Sign In</h2>
                  <p className="font-display text-sm text-white/60 uppercase tracking-wider">Enter the arena. Begin your training.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="alert alert-error"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-5">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      label="Email Address"
                      leftIcon={<Mail className="w-5 h-5" />}
                      placeholder="player@example.com"
                      autoComplete="email"
                      required
                    />

                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      label="Password"
                      leftIcon={<Lock className="w-5 h-5" />}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    {isLoading ? 'Connecting...' : 'Enter Arena'}
                  </Button>
                </form>

                <div className="divider"></div>

                <p className="text-center text-sm text-white/60">
                  New to the platform?{' '}
                  <Link to="/register" className="link link-primary font-semibold hover:text-primary">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
