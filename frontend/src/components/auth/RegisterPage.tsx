import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

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
  const passwordValid = password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-50">
              Create Account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Start mastering chess openings today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm flex items-center gap-3"
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
                  className="mt-2"
                >
                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs transition-colors',
                      passwordValid ? 'text-green-400' : 'text-slate-500'
                    )}
                  >
                    <Check className={cn('h-3 w-3', passwordValid ? 'opacity-100' : 'opacity-30')} />
                    At least 8 characters
                  </div>
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
              className="w-full mt-2"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Create account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700">
            <p className="text-center text-sm text-slate-500">
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-5 text-xs text-slate-600"
        >
          Join thousands of players improving their openings
        </motion.p>
      </motion.div>
    </div>
  );
}
