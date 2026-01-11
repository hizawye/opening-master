import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { repertoireApi } from '../../api/repertoire';
import { practiceApi } from '../../api/practice';
import type { Repertoire } from '../../types/repertoire';
import { Play, Shuffle, Target, ChevronLeft, ChevronRight, Swords, BookOpen } from 'lucide-react';
import { Header } from '../layout/Header';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../utils/cn';

type Step = 'repertoire' | 'mode' | 'opening' | 'ready';

const stepOrder: Step[] = ['repertoire', 'mode', 'opening', 'ready'];

const stepInfo = {
  repertoire: { title: 'Choose Repertoire', subtitle: 'Select which opening lines to practice' },
  mode: { title: 'Practice Mode', subtitle: 'How do you want to train?' },
  opening: { title: 'Select Opening', subtitle: 'Focus on a specific line' },
  ready: { title: 'Ready to Practice', subtitle: 'Review your setup and start' },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function PracticeSetup() {
  const navigate = useNavigate();
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRepertoire, setSelectedRepertoire] = useState<string | null>(null);
  const [selectedOpening, setSelectedOpening] = useState<string | null>(null);
  const [mode, setMode] = useState<'random' | 'specific'>('random');
  const [isStarting, setIsStarting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('repertoire');
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    loadRepertoires();
  }, []);

  const loadRepertoires = async () => {
    try {
      const data = await repertoireApi.list();
      setRepertoires(data);
      if (data.length > 0) {
        setSelectedRepertoire(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load repertoires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = async () => {
    if (!selectedRepertoire) return;

    setIsStarting(true);
    try {
      const session = await practiceApi.start({
        repertoire_id: selectedRepertoire,
        opening_id: mode === 'specific' ? selectedOpening || undefined : undefined,
        mode,
      });
      navigate(`/practice/${session.id}`);
    } catch (error) {
      console.error('Failed to start practice:', error);
      setIsStarting(false);
    }
  };

  const selectedRepertoireData = repertoires.find((r) => r.id === selectedRepertoire);

  const getCurrentStepIndex = () => stepOrder.indexOf(currentStep);

  const getNextStep = (): Step | null => {
    const idx = getCurrentStepIndex();
    if (currentStep === 'mode' && mode === 'random') {
      return 'ready'; // Skip opening selection for random mode
    }
    if (idx < stepOrder.length - 1) {
      return stepOrder[idx + 1];
    }
    return null;
  };

  const getPrevStep = (): Step | null => {
    const idx = getCurrentStepIndex();
    if (currentStep === 'ready' && mode === 'random') {
      return 'mode'; // Skip back to mode if we came from random
    }
    if (idx > 0) {
      return stepOrder[idx - 1];
    }
    return null;
  };

  const goToNext = () => {
    const next = getNextStep();
    if (next) {
      setDirection(1);
      setCurrentStep(next);
    }
  };

  const goToPrev = () => {
    const prev = getPrevStep();
    if (prev) {
      setDirection(-1);
      setCurrentStep(prev);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'repertoire':
        return !!selectedRepertoire;
      case 'mode':
        return true;
      case 'opening':
        return mode === 'random' || !!selectedOpening || (selectedRepertoireData?.openings?.length || 0) === 0;
      case 'ready':
        return true;
      default:
        return false;
    }
  };

  // Calculate progress
  const getProgress = () => {
    const steps = mode === 'random' ? ['repertoire', 'mode', 'ready'] : stepOrder;
    const idx = steps.indexOf(currentStep);
    return ((idx + 1) / steps.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Header title="Practice Setup" backTo="/" />

      <PageContainer maxWidth="sm">
        {repertoires.length === 0 ? (
          <Card className="text-center py-12">
            <div className="relative inline-block mb-4">
              <Swords className="h-16 w-16 text-[var(--text-muted)] mx-auto" />
              <motion.div
                className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-secondary)]">
              No repertoires found
            </h3>
            <p className="text-[var(--text-muted)] mt-1 mb-6 max-w-xs mx-auto">
              Create a repertoire first to start practicing your openings
            </p>
            <Link to="/">
              <Button leftIcon={<BookOpen className="h-4 w-4" />}>Go to Dashboard</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="relative">
              <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[var(--text-muted)]">{stepInfo[currentStep].title}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  Step {getCurrentStepIndex() + 1} of {mode === 'random' ? 3 : 4}
                </span>
              </div>
            </div>

            {/* Step Content */}
            <Card className="overflow-hidden min-h-[350px] relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="p-4 sm:p-6"
                >
                  {/* Step Header */}
                  <div className="mb-6 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {stepInfo[currentStep].title}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {stepInfo[currentStep].subtitle}
                    </p>
                  </div>

                  {/* Repertoire Selection */}
                  {currentStep === 'repertoire' && (
                    <div className="grid grid-cols-1 gap-3">
                      {repertoires.map((repertoire) => (
                        <motion.button
                          key={repertoire.id}
                          onClick={() => {
                            setSelectedRepertoire(repertoire.id);
                            setSelectedOpening(null);
                          }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden',
                            selectedRepertoire === repertoire.id
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-white/10 hover:border-white/20 bg-[var(--bg-elevated)]'
                          )}
                        >
                          {/* Color indicator */}
                          <div
                            className={cn(
                              'absolute top-0 left-0 bottom-0 w-1',
                              repertoire.color === 'white'
                                ? 'bg-gradient-to-b from-gray-200 to-gray-300'
                                : 'bg-gradient-to-b from-gray-700 to-gray-800'
                            )}
                          />
                          <div className="flex items-center gap-4 pl-3">
                            <div
                              className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                                repertoire.color === 'white'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-gray-800 text-gray-100'
                              )}
                            >
                              {repertoire.color === 'white' ? '♔' : '♚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[var(--text-primary)] truncate">
                                {repertoire.name}
                              </p>
                              <p className="text-sm text-[var(--text-muted)]">
                                {repertoire.openings?.length || 0} opening{(repertoire.openings?.length || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {selectedRepertoire === repertoire.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center"
                              >
                                <ChevronRight className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Mode Selection */}
                  {currentStep === 'mode' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.button
                        onClick={() => setMode('random')}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'p-6 rounded-xl border-2 text-center transition-all',
                          mode === 'random'
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 hover:border-white/20 bg-[var(--bg-elevated)]'
                        )}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                          <Shuffle className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-semibold text-[var(--text-primary)] mb-1">Random</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          Practice random openings from your repertoire
                        </p>
                      </motion.button>

                      <motion.button
                        onClick={() => setMode('specific')}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'p-6 rounded-xl border-2 text-center transition-all',
                          mode === 'specific'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/10 hover:border-white/20 bg-[var(--bg-elevated)]'
                        )}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                          <Target className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-semibold text-[var(--text-primary)] mb-1">Specific</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          Focus on mastering one opening line
                        </p>
                      </motion.button>
                    </div>
                  )}

                  {/* Opening Selection */}
                  {currentStep === 'opening' && selectedRepertoireData && (
                    <div>
                      {selectedRepertoireData.openings && selectedRepertoireData.openings.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {selectedRepertoireData.openings.map((opening) => (
                            <motion.button
                              key={opening.id}
                              onClick={() => setSelectedOpening(opening.id)}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                'w-full p-4 rounded-xl border-2 text-left transition-all',
                                selectedOpening === opening.id
                                  ? 'border-purple-500 bg-purple-500/10'
                                  : 'border-white/10 hover:border-white/20 bg-[var(--bg-elevated)]'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-[var(--text-primary)]">{opening.name}</p>
                                  <p className="text-sm text-[var(--text-muted)]">
                                    {opening.eco || 'Custom opening'}
                                  </p>
                                </div>
                                {selectedOpening === opening.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                                  >
                                    <ChevronRight className="h-4 w-4 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                          <p className="text-[var(--text-muted)]">No openings in this repertoire yet</p>
                          <p className="text-sm text-[var(--text-muted)] mt-1">
                            Add openings to your repertoire first
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ready to Practice */}
                  {currentStep === 'ready' && selectedRepertoireData && (
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative inline-block mb-6"
                      >
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                          <Swords className="h-12 w-12 text-white" />
                        </div>
                        <motion.div
                          className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full -z-10"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                        You're all set!
                      </h3>

                      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 mb-6 text-left">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-muted)]">Repertoire</span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {selectedRepertoireData.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-muted)]">Color</span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {selectedRepertoireData.color === 'white' ? '♔ White' : '♚ Black'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-muted)]">Mode</span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {mode === 'random' ? 'Random openings' : 'Specific opening'}
                            </span>
                          </div>
                          {mode === 'specific' && selectedOpening && (
                            <div className="flex justify-between items-center">
                              <span className="text-[var(--text-muted)]">Opening</span>
                              <span className="font-medium text-[var(--text-primary)]">
                                {selectedRepertoireData.openings?.find(o => o.id === selectedOpening)?.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleStartPractice}
                        isLoading={isStarting}
                        size="lg"
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/20"
                        leftIcon={<Play className="h-5 w-5" />}
                      >
                        Start Practice
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep !== 'repertoire' && (
                <Button
                  variant="secondary"
                  onClick={goToPrev}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep !== 'ready' && (
                <Button
                  onClick={goToNext}
                  disabled={!canProceed()}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                  className="flex-1"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
