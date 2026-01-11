import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, ArrowRight, Swords } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

// Floating chess pieces for decoration
const floatingPieces = [
  { piece: '♔', x: '10%', y: '15%', delay: 0, duration: 6 },
  { piece: '♛', x: '85%', y: '20%', delay: 1, duration: 7 },
  { piece: '♘', x: '15%', y: '75%', delay: 2, duration: 5 },
  { piece: '♜', x: '80%', y: '80%', delay: 0.5, duration: 8 },
  { piece: '♗', x: '5%', y: '45%', delay: 1.5, duration: 6 },
  { piece: '♞', x: '90%', y: '50%', delay: 2.5, duration: 7 },
];

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[var(--bg-base)]">
        {/* Chess board pattern overlay */}
        <div className="absolute inset-0 bg-chess-pattern-lg opacity-30" />

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
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
              rotate: [0, 5, -5, 0],
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
            className="text-center mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full -z-10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              Welcome Back
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Sign in to continue your training
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Swords className="h-4 w-4" />
                </div>
                {error}
              </motion.div>
            )}

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

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </Card>

        {/* Bottom decoration */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-xs text-[var(--text-muted)]"
        >
          Master your chess openings with focused practice
        </motion.p>
      </motion.div>
    </div>
  );
}
