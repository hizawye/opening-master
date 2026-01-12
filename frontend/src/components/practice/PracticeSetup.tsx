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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header title="Practice Setup" backTo="/" />

      <PageContainer maxWidth="sm">
        {repertoires.length === 0 ? (
          <Card className="text-center py-12">
            <div className="relative inline-block mb-4">
              <Swords className="h-16 w-16 text-primary/40 mx-auto" />
              <motion.div
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              No repertoires found
            </h3>
            <p className="text-white/60 mt-1 mb-6 max-w-xs mx-auto font-body">
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
              <div className="h-1 bg-white/10 rounded-full overflow-hidden border border-primary/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-accent to-error glow-primary-strong"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-body text-xs text-primary uppercase tracking-wider">{stepInfo[currentStep].title}</span>
                <span className="font-mono text-xs text-white/60">
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
                    <h2 className="font-display text-xl font-bold text-electric">
                      {stepInfo[currentStep].title}
                    </h2>
                    <p className="font-body text-sm text-white/60 mt-1">
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
                          className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                            selectedRepertoire === repertoire.id
                              ? 'border-primary bg-primary/10 shadow-glow-primary'
                              : 'border-white/10 bg-[#1a1a2e]/60 hover:border-primary/50'
                          }`}
                        >
                          {/* Animated accent bar */}
                          <div
                            className={`absolute top-0 left-0 bottom-0 w-1 transition-all ${
                              repertoire.color === 'white'
                                ? 'bg-gradient-to-b from-primary to-accent'
                                : 'bg-gradient-to-b from-accent to-error'
                            } ${selectedRepertoire === repertoire.id ? 'opacity-100' : 'opacity-50'}`}
                          />

                          <div className="flex items-center gap-4 pl-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border-2 ${
                                repertoire.color === 'white'
                                  ? 'bg-white/10 border-primary/30 text-white'
                                  : 'bg-black/20 border-accent/30 text-white'
                              } ${selectedRepertoire === repertoire.id ? 'shadow-glow-primary' : ''}`}
                            >
                              {repertoire.color === 'white' ? '♔' : '♚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-semibold text-white truncate group-hover:text-electric transition-colors">
                                {repertoire.name}
                              </p>
                              <p className="font-mono text-sm text-primary">
                                {repertoire.openings?.length || 0} opening{(repertoire.openings?.length || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {selectedRepertoire === repertoire.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-glow-primary"
                              >
                                <ChevronRight className="w-5 h-5 text-black" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Mode Selection */}
                  {currentStep === 'mode' && (
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        onClick={() => setMode('random')}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-2xl border-2 text-center transition-all cursor-pointer group ${
                          mode === 'random'
                            ? 'border-primary bg-primary/10 shadow-glow-primary'
                            : 'border-white/10 bg-[#1a1a2e]/60 hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 ${
                          mode === 'random' ? 'shadow-glow-primary animate-glow' : 'shadow-lg'
                        }`}>
                          <Shuffle className="w-7 h-7 text-white" />
                        </div>
                        <p className="font-display font-semibold text-white mb-1 group-hover:text-electric transition-colors">Random</p>
                        <p className="font-body text-sm text-white/60">
                          Practice random openings from your repertoire
                        </p>
                      </motion.button>

                      <motion.button
                        onClick={() => setMode('specific')}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-2xl border-2 text-center transition-all cursor-pointer group ${
                          mode === 'specific'
                            ? 'border-accent bg-accent/10 shadow-glow-purple'
                            : 'border-white/10 bg-[#1a1a2e]/60 hover:border-accent/50'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br from-accent to-error flex items-center justify-center mx-auto mb-4 ${
                          mode === 'specific' ? 'shadow-glow-purple animate-glow' : 'shadow-lg'
                        }`}>
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <p className="font-display font-semibold text-white mb-1 group-hover:text-electric-purple transition-colors">Specific</p>
                        <p className="font-body text-sm text-white/60">
                          Focus on mastering one opening line
                        </p>
                      </motion.button>
                    </div>
                  )}

                  {/* Opening Selection */}
                  {currentStep === 'opening' && selectedRepertoireData && (
                    <div>
                      {selectedRepertoireData.openings && selectedRepertoireData.openings.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
                          {selectedRepertoireData.openings.map((opening) => (
                            <motion.button
                              key={opening.id}
                              onClick={() => setSelectedOpening(opening.id)}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group ${
                                selectedOpening === opening.id
                                  ? 'border-accent bg-accent/10 shadow-glow-purple'
                                  : 'border-white/10 bg-[#1a1a2e]/60 hover:border-accent/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-display font-medium text-white group-hover:text-electric-purple transition-colors">{opening.name}</p>
                                  <p className="font-mono text-sm text-white/60">
                                    {opening.eco || 'Custom opening'}
                                  </p>
                                </div>
                                {selectedOpening === opening.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-glow-purple"
                                  >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-white/40 mx-auto mb-3" />
                          <p className="text-white/60 font-body">No openings in this repertoire yet</p>
                          <p className="text-sm text-white/40 mt-1 font-body">
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
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-error flex items-center justify-center shadow-xl shadow-primary/30 animate-circuit-pulse">
                          <Swords className="h-12 w-12 text-white" />
                        </div>
                        <motion.div
                          className="absolute inset-0 bg-primary/30 blur-2xl rounded-full -z-10"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      <h3 className="font-display text-lg font-bold text-electric mb-4">
                        You're all set!
                      </h3>

                      <div className="bg-[#1a1a2e]/60 backdrop-blur-xl rounded-xl p-4 mb-6 text-left border border-primary/20">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-body text-white/60">Repertoire</span>
                            <span className="font-display font-medium text-white">
                              {selectedRepertoireData.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-body text-white/60">Color</span>
                            <span className="font-display font-medium text-white">
                              {selectedRepertoireData.color === 'white' ? '♔ White' : '♚ Black'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-body text-white/60">Mode</span>
                            <span className="font-display font-medium text-white">
                              {mode === 'random' ? 'Random openings' : 'Specific opening'}
                            </span>
                          </div>
                          {mode === 'specific' && selectedOpening && (
                            <div className="flex justify-between items-center">
                              <span className="font-body text-white/60">Opening</span>
                              <span className="font-display font-medium text-white">
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
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 shadow-xl shadow-primary/20 glow-primary-strong"
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
