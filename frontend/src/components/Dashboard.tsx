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
import { cn } from '../utils/cn';

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
    <div className="min-h-screen bg-slate-950">
      <Header showLogo />

      <PageContainer>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-indigo-200 text-sm">Welcome back,</p>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {user?.username || user?.email?.split('@')[0] || 'Player'}
              </h1>
            </div>
          </div>

          <p className="text-indigo-100 mb-6 max-w-md">
            Master your opening repertoire with focused practice sessions and AI-powered analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/practice')}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
              size="lg"
            >
              Start Practice
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="h-5 w-5" />}
              className="border border-white/20"
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
            className="grid grid-cols-3 gap-3 mb-8"
          >
            <Card padding="sm" className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-slate-50">{repertoires.length}</p>
              <p className="text-xs sm:text-sm text-slate-500">Repertoires</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-indigo-400">
                {repertoires.reduce((acc, r) => acc + (r.openings?.length || 0), 0)}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Openings</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">
                {repertoires.filter(r => r.color === 'white').length}W / {repertoires.filter(r => r.color === 'black').length}B
              </p>
              <p className="text-xs sm:text-sm text-slate-500">White/Black</p>
            </Card>
          </motion.div>
        )}

        {/* Repertoires Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Your Repertoires
            </h2>
            {repertoires.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-40 animate-pulse" />
              ))}
            </div>
          ) : repertoires.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No repertoires yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Create your first repertoire to start building your opening knowledge.
              </p>
              <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
                Create Your First Repertoire
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repertoires.map((repertoire) => (
                <Card
                  key={repertoire.id}
                  variant="interactive"
                  className="group"
                  onClick={() => navigate(`/repertoire/${repertoire.id}`)}
                >
                  {/* Color indicator */}
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-1 rounded-t-xl',
                      repertoire.color === 'white' ? 'bg-slate-300' : 'bg-slate-700'
                    )}
                  />

                  <div className="pt-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                            repertoire.color === 'white' ? 'bg-slate-300 text-slate-800' : 'bg-slate-700 text-slate-100'
                          )}
                        >
                          {repertoire.color === 'white' ? '♔' : '♚'}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-50 group-hover:text-indigo-400 transition-colors">
                            {repertoire.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {repertoire.openings?.length || 0} opening{(repertoire.openings?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRepertoire(repertoire.id);
                        }}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <span className="text-xs text-slate-500">
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
                          leftIcon={<Edit3 className="h-3 w-3" />}
                          className="text-xs"
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
                          leftIcon={<Play className="h-3 w-3" />}
                          className="text-xs"
                        >
                          Practice
                        </Button>
                      </div>
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
          <div className="space-y-4">
            <Input
              label="Name"
              value={newRepertoireName}
              onChange={(e) => setNewRepertoireName(e.target.value)}
              placeholder="My Repertoire"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Color
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setNewRepertoireColor('white')}
                  className={cn(
                    'flex-1 py-3 rounded-lg border-2 transition-all font-medium',
                    newRepertoireColor === 'white'
                      ? 'border-indigo-500 bg-slate-700 text-slate-50'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  )}
                >
                  ♔ White
                </button>
                <button
                  type="button"
                  onClick={() => setNewRepertoireColor('black')}
                  className={cn(
                    'flex-1 py-3 rounded-lg border-2 transition-all font-medium',
                    newRepertoireColor === 'black'
                      ? 'border-indigo-500 bg-slate-700 text-slate-50'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  )}
                >
                  ♚ Black
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
