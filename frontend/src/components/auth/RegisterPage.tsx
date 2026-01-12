import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

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
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex items-center justify-center p-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          <div className="card bg-[#1a1a2e]/90 shadow-2xl border border-accent/20 backdrop-blur-xl">
            <div className="card-body p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg glow-purple">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-3xl font-bold text-white mb-2">Join Arena</h2>
                <p className="font-display text-sm text-white/60 uppercase tracking-wider">Begin your path to mastery</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  leftIcon={<User className="w-5 h-5" />}
                  placeholder="ChessMaster2000"
                  autoComplete="username"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-5 h-5" />}
                  placeholder="player@example.com"
                  autoComplete="email"
                  required
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-5 h-5" />}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`mt-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider ${
                        passwordValid ? 'text-success' : 'text-base-content/60'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        passwordValid
                          ? 'border-success bg-success/20'
                          : 'border-base-content/60'
                      }`}>
                        {passwordValid && <Check className="w-2.5 h-2.5" />}
                      </div>
                      8+ Characters
                    </motion.div>
                  )}
                </div>

                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-5 h-5" />}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mt-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider ${
                        passwordsMatch ? 'text-success' : 'text-error'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        passwordsMatch
                          ? 'border-success bg-success/20'
                          : 'border-error bg-error/20'
                      }`}>
                        {passwordsMatch ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          <AlertCircle className="w-2.5 h-2.5" />
                        )}
                      </div>
                      {passwordsMatch ? 'Passwords Match' : "Passwords Don't Match"}
                    </motion.div>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full mt-2"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {isLoading ? 'Creating Account...' : 'Join Now'}
                </Button>
              </form>

              <div className="divider"></div>

              <p className="text-center text-sm text-white/60">
                Already training?{' '}
                <Link to="/login" className="link link-primary font-semibold hover:text-primary">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
