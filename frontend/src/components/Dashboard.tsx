import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Play, Trash2, Edit3, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { repertoireApi } from '../api/repertoire';
import type { Repertoire } from '../types/repertoire';
import { Header } from './layout/Header';
import { PageContainer } from './layout/PageContainer';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepertoireName, setNewRepertoireName] = useState('');
  const [newRepertoireColor, setNewRepertoireColor] = useState<'white' | 'black'>('white');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadRepertoires();
  }, []);

  const loadRepertoires = async () => {
    try {
      const data = await repertoireApi.list();
      setRepertoires(data);
    } catch (error) {
      console.error('Failed to load repertoires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepertoire = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newRepertoire = await repertoireApi.create({
        name: newRepertoireName,
        color: newRepertoireColor,
      });
      setRepertoires([...repertoires, newRepertoire]);
      setShowCreateModal(false);
      setNewRepertoireName('');
    } catch (error) {
      console.error('Failed to create repertoire:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRepertoire = async (id: string) => {
    if (!confirm('Are you sure you want to delete this repertoire?')) return;
    try {
      await repertoireApi.delete(id);
      setRepertoires(repertoires.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete repertoire:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header showLogo />

      <PageContainer>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent p-6 shadow-2xl glow-primary"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-2xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-display">Welcome back,</p>
              <h1 className="text-xl font-bold text-white font-display">
                {user?.username || user?.email?.split('@')[0] || 'Player'}
              </h1>
            </div>
          </div>

          <p className="text-white/90 mb-6 max-w-md font-body">
            Master your opening repertoire with focused practice sessions and AI-powered analysis.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/practice')}
              variant="primary"
              size="lg"
            >
              Start Practice
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus style={{ width: '1.25rem', height: '1.25rem' }} />}
            >
              New Repertoire
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {repertoires.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 max-w-3xl mb-8"
          >
            <Card padding="sm" className="text-center bg-[#1a1a2e]/60 backdrop-blur-xl border border-primary/10">
              <p className="text-3xl font-bold text-white font-display">{repertoires.length}</p>
              <p className="text-xs uppercase tracking-wider text-white/60 font-display">Repertoires</p>
            </Card>
            <Card padding="sm" className="text-center bg-[#1a1a2e]/60 backdrop-blur-xl border border-primary/10">
              <p className="text-3xl font-bold text-white font-display">
                {repertoires.reduce((acc, r) => acc + (r.openings?.length || 0), 0)}
              </p>
              <p className="text-xs uppercase tracking-wider text-white/60 font-display">Openings</p>
            </Card>
            <Card padding="sm" className="text-center bg-[#1a1a2e]/60 backdrop-blur-xl border border-primary/10">
              <p className="text-3xl font-bold text-accent font-display">
                {repertoires.filter(r => r.color === 'white').length}W / {repertoires.filter(r => r.color === 'black').length}B
              </p>
              <p className="text-xs uppercase tracking-wider text-white/60 font-display">White/Black</p>
            </Card>
          </motion.div>
        )}

        {/* Repertoires Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-electric flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Your Repertoires
            </h2>
            {repertoires.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus style={{ width: '1rem', height: '1rem' }} />}
              >
                Add
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-40 animate-skeleton" />
              ))}
            </div>
          ) : repertoires.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">No repertoires yet</h3>
              <p className="text-white/60 mb-6 font-body">
                Create your first repertoire to start building your opening knowledge.
              </p>
              <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus style={{ width: '1rem', height: '1rem' }} />}>
                Create Your First Repertoire
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repertoires.map((repertoire, index) => (
                <Card
                  key={repertoire.id}
                  variant="interactive"
                  className="relative overflow-hidden group"
                  onClick={() => navigate(`/repertoire/${repertoire.id}`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Animated color accent bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      repertoire.color === 'white'
                        ? 'bg-gradient-to-r from-primary to-accent'
                        : 'bg-gradient-to-r from-accent to-error'
                    } animate-shimmer`}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border-2 ${
                          repertoire.color === 'white'
                            ? 'bg-white/10 border-primary/30 text-white shadow-glow-primary'
                            : 'bg-black/20 border-accent/30 text-white shadow-glow-purple'
                        }`}
                      >
                        {repertoire.color === 'white' ? '♔' : '♚'}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-white group-hover:text-electric transition-colors">
                          {repertoire.name}
                        </h3>
                        <p className="font-mono text-xs text-primary">
                          {repertoire.openings?.length || 0} opening{(repertoire.openings?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRepertoire(repertoire.id);
                      }}
                      className="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <span className="font-body text-sm text-white/60 uppercase tracking-wider">
                      {repertoire.color === 'white' ? 'Playing White' : 'Playing Black'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/repertoire/${repertoire.id}`);
                        }}
                        leftIcon={<Edit3 style={{ width: '0.75rem', height: '0.75rem' }} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/practice');
                        }}
                        leftIcon={<Play style={{ width: '0.75rem', height: '0.75rem' }} />}
                      >
                        Practice
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Repertoire"
      >
        <form onSubmit={handleCreateRepertoire}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Name"
              value={newRepertoireName}
              onChange={(e) => setNewRepertoireName(e.target.value)}
              placeholder="My Repertoire"
              required
            />

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '0.5rem',
              }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setNewRepertoireColor('white')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${newRepertoireColor === 'white' ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: newRepertoireColor === 'white' ? 'rgba(26, 26, 46, 0.8)' : '#1a1a2e',
                    color: newRepertoireColor === 'white' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ♔ White
                </button>
                <button
                  type="button"
                  onClick={() => setNewRepertoireColor('black')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${newRepertoireColor === 'black' ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: newRepertoireColor === 'black' ? 'rgba(26, 26, 46, 0.8)' : '#1a1a2e',
                    color: newRepertoireColor === 'black' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ♚ Black
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setShowCreateModal(false)}
              className="u-flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} className="u-flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
