import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

// Floating chess pieces for decoration
const floatingPieces = [
  { piece: '♚', x: '8%', y: '12%', delay: 0.5, duration: 7 },
  { piece: '♕', x: '88%', y: '18%', delay: 0, duration: 6 },
  { piece: '♞', x: '12%', y: '78%', delay: 1.5, duration: 5 },
  { piece: '♖', x: '85%', y: '75%', delay: 1, duration: 8 },
  { piece: '♝', x: '6%', y: '48%', delay: 2, duration: 6 },
  { piece: '♘', x: '92%', y: '45%', delay: 2.5, duration: 7 },
];

// Password requirements
const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, username);
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[var(--bg-base)]">
        {/* Chess board pattern overlay */}
        <div className="absolute inset-0 bg-chess-pattern-lg opacity-30" />

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating chess pieces */}
        {floatingPieces.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl text-white/5 select-none pointer-events-none"
            style={{ left: item.x, top: item.y }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 0.1,
              y: [0, -20, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          >
            {item.piece}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card variant="glass" padding="lg" className="backdrop-blur-2xl border-white/10">
          {/* Logo */}
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full -z-10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[var(--text-primary)]">
              Create Account
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Start mastering chess openings today
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                {error}
              </motion.div>
            )}

            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="h-5 w-5" />}
              placeholder="ChessMaster2000"
              autoComplete="username"
              required
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-5 w-5" />}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              {/* Password requirements */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1"
                >
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center gap-2 text-xs transition-colors',
                        req.test(password) ? 'text-green-400' : 'text-[var(--text-muted)]'
                      )}
                    >
                      <Check className={cn('h-3 w-3', req.test(password) ? 'opacity-100' : 'opacity-30')} />
                      {req.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              {confirmPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'mt-2 flex items-center gap-2 text-xs',
                    passwordsMatch ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3 w-3" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Passwords do not match
                    </>
                  )}
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/25 mt-2"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Create account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Bottom decoration */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-5 text-xs text-[var(--text-muted)]"
        >
          Join thousands of players improving their openings
        </motion.p>
      </motion.div>
    </div>
  );
}
