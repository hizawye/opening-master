import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { practiceApi } from '../../api/practice';
import { repertoireApi } from '../../api/repertoire';
import { teachingApi } from '../../api/teaching';
import { useLichessExplorer } from '../../hooks/useLichessExplorer';
import { useStockfish } from '../../hooks/useStockfish';
import { categorizeMove, calculateCentipawnLoss, CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/moveEvaluation';
import type { PracticeSession as PracticeSessionType, MoveCategory } from '../../types/practice';
import type { Repertoire } from '../../types/repertoire';
import { Trophy, RotateCcw, Sparkles, ChevronUp, X } from 'lucide-react';
import { Header } from '../layout/Header';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { AccuracyRing } from '../ui/AccuracyRing';
import { MoveFeedback } from './MoveFeedback';

interface MoveResult {
  move: string;
  category: MoveCategory;
  explanation?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function PracticeSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<PracticeSessionType | null>(null);
  const [repertoire, setRepertoire] = useState<Repertoire | null>(null);
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [isLoading, setIsLoading] = useState(true);
  const [moveResults, setMoveResults] = useState<MoveResult[]>([]);
  const [lastMoveResult, setLastMoveResult] = useState<MoveResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);

  const { isBookMove } = useLichessExplorer(fen);
  const { isReady: stockfishReady, getBestMove, getEvaluation } = useStockfish();

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const sessionData = await practiceApi.getSession(sessionId!);
      setSession(sessionData);

      const repertoireData = await repertoireApi.get(sessionData.repertoire_id);
      setRepertoire(repertoireData);

      // If playing black, AI makes first move
      if (sessionData.color === 'black') {
        await makeAiMove();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      navigate('/practice');
    } finally {
      setIsLoading(false);
    }
  };

  const makeAiMove = useCallback(async () => {
    if (!stockfishReady) return;

    setAiThinking(true);
    try {
      // Get best move from Stockfish or repertoire
      const bestMove = await getBestMove(game.fen());
      if (bestMove) {
        const move = game.move(bestMove);
        if (move) {
          setFen(game.fen());
        }
      }
    } catch (error) {
      console.error('AI move failed:', error);
    } finally {
      setAiThinking(false);
    }
  }, [stockfishReady, getBestMove, game]);

  const processMove = async (_sourceSquare: string, _targetSquare: string, moveSan: string, fenBefore: string, fenAfter: string) => {
    try {
      const evalBefore = stockfishReady ? await getEvaluation(fenBefore) : 0;
      const evalAfter = stockfishReady ? await getEvaluation(fenAfter) : 0;

      // Check if it's a book move
      const bookMove = isBookMove(moveSan);

      // Calculate centipawn loss and categorize
      const cpLoss = calculateCentipawnLoss(evalBefore, evalAfter, session?.color || 'white');
      const category = categorizeMove(cpLoss, bookMove);

      // Submit move to backend
      await practiceApi.submitMove(sessionId!, {
        fen_before: fenBefore,
        fen_after: fenAfter,
        user_move: moveSan,
        category,
        eval_before: evalBefore,
        eval_after: evalAfter,
        centipawn_loss: cpLoss,
      });

      const result: MoveResult = { move: moveSan, category };
      setMoveResults((prev) => [...prev, result]);
      setLastMoveResult(result);

      // Check if session should end (15 moves or game over)
      const moveCount = game.history().length;
      if (moveCount >= 30 || game.isGameOver()) {
        await endSession();
      } else {
        // AI responds
        setTimeout(() => makeAiMove(), 500);
      }
    } catch (error) {
      console.error('Move evaluation failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMove = (sourceSquare: string, targetSquare: string): boolean => {
    if (isAnalyzing || aiThinking || isSessionComplete) return false;

    // Check if it's the player's turn
    const isWhiteTurn = game.turn() === 'w';
    const isPlayerTurn = (session?.color === 'white' && isWhiteTurn) || (session?.color === 'black' && !isWhiteTurn);

    if (!isPlayerTurn) return false;

    const fenBefore = game.fen();

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!move) {
        return false;
      }

      const fenAfter = game.fen();
      setFen(fenAfter);
      setIsAnalyzing(true);

      // Process move asynchronously
      processMove(sourceSquare, targetSquare, move.san, fenBefore, fenAfter);

      return true;
    } catch {
      return false;
    }
  };

  const endSession = async () => {
    try {
      const finalSession = await practiceApi.end(sessionId!);
      setSession(finalSession);
      setIsSessionComplete(true);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleGetExplanation = async () => {
    if (!lastMoveResult || lastMoveResult.category === 'book' || lastMoveResult.category === 'best') {
      return;
    }

    setLoadingExplanation(true);
    setShowExplanation(true);

    try {
      const bestMove = await getBestMove(fen);
      const analysis = await teachingApi.analyzeMistake({
        fen,
        played_move: lastMoveResult.move,
        best_move: bestMove || lastMoveResult.move,
        centipawn_loss: 0,
      });
      setExplanation(analysis);
    } catch (error) {
      setExplanation('Unable to generate explanation at this time.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Calculate accuracy percentage for the ring
  const calculateAccuracy = () => {
    if (moveResults.length === 0) return 0;
    const goodMoves = moveResults.filter(
      (r) => r.category === 'book' || r.category === 'best' || r.category === 'good'
    ).length;
    return Math.round((goodMoves / moveResults.length) * 100);
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
      <Header
        title="Practice Session"
        subtitle={repertoire?.name}
        backTo="/practice"
        actions={
          !isSessionComplete && (
            <Button variant="secondary" size="sm" onClick={endSession}>
              End Session
            </Button>
          )
        }
      />

      <PageContainer>
        <AnimatePresence mode="wait">
          {isSessionComplete ? (
            // Session Summary
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="text-center py-12">
                {/* Trophy with glow effect */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="relative inline-block mb-6"
                >
                  <Trophy className="h-20 w-20 text-yellow-400 mx-auto" />
                  <motion.div
                    className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Session Complete!
                  </h2>
                  <p className="text-white/80 mb-8">Here's how you did:</p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                >
                  <motion.div variants={itemVariants}>
                    <Card padding="sm" className="bg-[#1a1a2e]/60">
                      <p className="text-3xl font-bold text-white">
                        {session?.stats.total_moves || 0}
                      </p>
                      <p className="text-sm text-white/60">Total Moves</p>
                    </Card>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Card padding="sm" className="bg-[#1a1a2e]/60">
                      <p className="text-3xl font-bold" style={{ color: CATEGORY_COLORS.book }}>
                        {session?.stats.book_moves || 0}
                      </p>
                      <p className="text-sm text-white/60">Book Moves</p>
                    </Card>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Card padding="sm" className="bg-[#1a1a2e]/60">
                      <p className="text-3xl font-bold" style={{ color: CATEGORY_COLORS.best }}>
                        {(session?.stats.best_moves || 0) + (session?.stats.good_moves || 0)}
                      </p>
                      <p className="text-sm text-white/60">Good Moves</p>
                    </Card>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Card padding="sm" className="bg-[#1a1a2e]/60">
                      <p className="text-3xl font-bold" style={{ color: CATEGORY_COLORS.mistake }}>
                        {(session?.stats.mistakes || 0) + (session?.stats.blunders || 0)}
                      </p>
                      <p className="text-sm text-white/60">Mistakes</p>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Accuracy Ring - Using new component */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8 flex justify-center"
                >
                  <AccuracyRing
                    percentage={session?.stats.accuracy_percentage || 0}
                    size="lg"
                    label="Accuracy"
                    animated={true}
                  />
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-4 justify-center"
                >
                  <Link to="/practice">
                    <Button leftIcon={<Sparkles className="h-5 w-5" />}>Practice Again</Button>
                  </Link>
                  <Link to="/">
                    <Button variant="secondary">Dashboard</Button>
                  </Link>
                </motion.div>
              </Card>
            </motion.div>
          ) : (
            // Practice Board
            <motion.div
              key="practice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* Mobile Stats Overlay - Fixed at top */}
              <div className="u-hide-desktop" style={{ position: 'fixed', top: '4rem', left: 0, right: 0, zIndex: 30, padding: '1rem 1rem 0.5rem' }}>
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowMobileStats(!showMobileStats)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>Moves</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{moveResults.length}</span>
                    </div>
                    <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>Accuracy</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#00f0ff' }}>{calculateAccuracy()}%</span>
                    </div>
                  </div>
                  <ChevronUp style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    transition: 'transform 0.2s',
                    transform: showMobileStats ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </motion.button>

                {/* Expandable Stats Panel */}
                <AnimatePresence>
                  {showMobileStats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-4 rounded-xl bg-[#1a1a2e]/80/95 backdrop-blur-xl border border-white/10 shadow-lg">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="text-center p-2 rounded-lg bg-[#1a1a2e]/60">
                            <p className="text-lg font-bold text-white">{moveResults.length}</p>
                            <p className="text-[10px] text-white/60">Total</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-[#1a1a2e]/60">
                            <p className="text-lg font-bold" style={{ color: CATEGORY_COLORS.book }}>
                              {moveResults.filter(r => r.category === 'book').length}
                            </p>
                            <p className="text-[10px] text-white/60">Book</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-[#1a1a2e]/60">
                            <p className="text-lg font-bold" style={{ color: CATEGORY_COLORS.best }}>
                              {moveResults.filter(r => r.category === 'best' || r.category === 'good').length}
                            </p>
                            <p className="text-[10px] text-white/60">Good</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-[#1a1a2e]/60">
                            <p className="text-lg font-bold" style={{ color: CATEGORY_COLORS.mistake }}>
                              {moveResults.filter(r => r.category === 'mistake' || r.category === 'blunder').length}
                            </p>
                            <p className="text-[10px] text-white/60">Errors</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full" onClick={() => setShowMobileStats(false)}>
                          <X className="h-4 w-4 mr-1" /> Close
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 pt-16 lg:pt-0">
                {/* Chess Board */}
                <div className="lg:col-span-2">
                  <Card padding="none" className="overflow-hidden">
                    {/* Board container - edge to edge on mobile */}
                    <div className="p-2 sm:p-6 bg-gradient-to-b from-white/[0.02] to-transparent">
                      <div className="max-w-lg mx-auto relative">
                        {/* Glow effect behind board */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl -z-10" />

                        <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                          <Chessboard
                            options={{
                              position: fen,
                              onPieceDrop: ({ sourceSquare, targetSquare }) =>
                                handleMove(sourceSquare, targetSquare || ''),
                              boardOrientation: session?.color || 'white',
                            }}
                          />
                        </div>

                        {/* Loading Overlay */}
                        <AnimatePresence>
                          {(isAnalyzing || aiThinking) && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-xl"
                            >
                              <div className="bg-[#1a1a2e]/80 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl">
                                <Spinner size="sm" />
                                <span className="text-white font-medium">
                                  {aiThinking ? 'AI thinking...' : 'Analyzing...'}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Last Move Feedback - Using new component */}
                    <div className="px-2 sm:px-6 pb-4">
                      {lastMoveResult ? (
                        <MoveFeedback
                          move={lastMoveResult.move}
                          category={lastMoveResult.category}
                          isVisible={true}
                          onRequestExplanation={
                            lastMoveResult.category !== 'book' && lastMoveResult.category !== 'best'
                              ? handleGetExplanation
                              : undefined
                          }
                          compact={false}
                        />
                      ) : (
                        <div className="p-4 rounded-xl bg-[#1a1a2e]/60 border border-white/5 text-center">
                          <p className="text-white/60 text-sm">Make your move to start</p>
                        </div>
                      )}
                    </div>

                    {/* Mobile Action Bar */}
                    <div className="lg:hidden flex items-center justify-center gap-3 px-4 pb-4 border-t border-white/5 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Undo functionality could be added here
                        }}
                        leftIcon={<RotateCcw className="h-4 w-4" />}
                        disabled
                      >
                        Undo
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={endSession}
                      >
                        End Session
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Desktop Sidebar - Hidden on mobile */}
                <div className="hidden lg:block space-y-4">
                  {/* Live Accuracy with Ring */}
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white mb-1">Session Accuracy</h3>
                        <p className="text-sm text-white/60">{moveResults.length} moves played</p>
                      </div>
                      <AccuracyRing percentage={calculateAccuracy()} size="sm" showLabel={false} />
                    </div>
                  </Card>

                  {/* Current Stats */}
                  <Card>
                    <h3 className="font-medium text-white mb-4">Move Breakdown</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#1a1a2e]/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-white">
                          {moveResults.length}
                        </p>
                        <p className="text-xs text-white/60">Total</p>
                      </div>
                      <div className="bg-[#1a1a2e]/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold" style={{ color: CATEGORY_COLORS.book }}>
                          {moveResults.filter((r) => r.category === 'book').length}
                        </p>
                        <p className="text-xs text-white/60">Book</p>
                      </div>
                      <div className="bg-[#1a1a2e]/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold" style={{ color: CATEGORY_COLORS.best }}>
                          {moveResults.filter((r) => r.category === 'best' || r.category === 'good').length}
                        </p>
                        <p className="text-xs text-white/60">Good</p>
                      </div>
                      <div className="bg-[#1a1a2e]/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold" style={{ color: CATEGORY_COLORS.mistake }}>
                          {moveResults.filter((r) => r.category === 'mistake' || r.category === 'blunder').length}
                        </p>
                        <p className="text-xs text-white/60">Errors</p>
                      </div>
                    </div>
                  </Card>

                  {/* Move History */}
                  <Card>
                    <h3 className="font-medium text-white mb-4">Move History</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {moveResults.length === 0 ? (
                        <p className="text-white/60 text-sm italic">
                          Your moves will appear here
                        </p>
                      ) : (
                        moveResults.map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-2 bg-[#1a1a2e]/60 rounded-lg"
                          >
                            <span className="text-white font-mono">{result.move}</span>
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[result.category]}20`,
                                color: CATEGORY_COLORS[result.category],
                              }}
                            >
                              {CATEGORY_LABELS[result.category]}
                            </span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageContainer>

      {/* Explanation Modal */}
      <Modal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        title="Move Analysis"
      >
        {loadingExplanation ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
            {explanation}
          </p>
        )}
        <div className="mt-6">
          <Button variant="secondary" className="w-full" onClick={() => setShowExplanation(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
