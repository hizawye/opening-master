import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { repertoireApi } from '../../api/repertoire';
import { useLichessExplorer } from '../../hooks/useLichessExplorer';
import type { Repertoire, MoveNode } from '../../types/repertoire';
import { Save, BookOpen, Lightbulb, RotateCcw, RefreshCw } from 'lucide-react';
import { Header } from '../layout/Header';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../utils/cn';

export default function RepertoireEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repertoire, setRepertoire] = useState<Repertoire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [selectedOpening, setSelectedOpening] = useState<number | null>(null);
  const [showAddOpening, setShowAddOpening] = useState(false);
  const [newOpeningName, setNewOpeningName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: explorerData, isLoading: explorerLoading } = useLichessExplorer(fen);

  useEffect(() => {
    if (id) {
      loadRepertoire();
    }
  }, [id]);

  const loadRepertoire = async () => {
    try {
      const data = await repertoireApi.get(id!);
      setRepertoire(data);
    } catch (error) {
      console.error('Failed to load repertoire:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        setFen(game.fen());
        setMoveHistory([...moveHistory, move.san]);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const handleUndo = () => {
    game.undo();
    setFen(game.fen());
    setMoveHistory(moveHistory.slice(0, -1));
  };

  const handleReset = () => {
    game.reset();
    setFen(game.fen());
    setMoveHistory([]);
  };

  const handleAddOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repertoire || !newOpeningName.trim()) return;

    setIsSaving(true);
    const moves: MoveNode[] = [];
    const tempGame = new Chess();

    for (const san of moveHistory) {
      const move = tempGame.move(san);
      if (move) {
        moves.push({
          fen: tempGame.fen(),
          move: move.san,
          uci: `${move.from}${move.to}${move.promotion || ''}`,
          is_main_line: true,
        });
      }
    }

    try {
      await repertoireApi.addOpening(repertoire.id, {
        name: newOpeningName,
        eco: explorerData?.opening?.eco || '',
        starting_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves,
      });
      await loadRepertoire();
      setShowAddOpening(false);
      setNewOpeningName('');
      handleReset();
    } catch (error) {
      console.error('Failed to add opening:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookMoveClick = (san: string) => {
    try {
      const move = game.move(san);
      if (move) {
        setFen(game.fen());
        setMoveHistory([...moveHistory, move.san]);
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
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
      <Header
        title={repertoire?.name}
        subtitle={`${repertoire?.color === 'white' ? '♔ White' : '♚ Black'} Repertoire`}
        backTo="/"
      />

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="none" className="overflow-hidden">
              {/* Board container with subtle glow */}
              <div className="p-6 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="max-w-lg mx-auto relative">
                  {/* Glow effect behind board */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl -z-10" />

                  <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Chessboard
                      options={{
                        position: fen,
                        onPieceDrop: ({ sourceSquare, targetSquare }) =>
                          handleMove(sourceSquare, targetSquare || ''),
                        boardOrientation: repertoire?.color || 'white',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="px-6 pb-4 flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0}
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                >
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddOpening(true)}
                  disabled={moveHistory.length === 0}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Opening
                </Button>
              </div>

              {/* Move history */}
              <div className="border-t border-white/5 p-4 bg-[var(--bg-elevated)]/50">
                <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-3">
                  Current Line
                </h3>
                <div className="flex flex-wrap gap-1">
                  {moveHistory.length === 0 ? (
                    <span className="text-[var(--text-muted)] text-sm italic">
                      Make moves on the board to build your repertoire
                    </span>
                  ) : (
                    moveHistory.map((move, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center"
                      >
                        {index % 2 === 0 && (
                          <span className="text-[var(--text-muted)] text-sm mr-1">
                            {Math.floor(index / 2) + 1}.
                          </span>
                        )}
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-sm font-mono">
                          {move}
                        </span>
                      </motion.span>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Opening Info */}
            {explorerData?.opening && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card variant="gradient" padding="sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-medium text-[var(--text-primary)]">
                      Current Opening
                    </h3>
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    {explorerData.opening.name}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-white/10 rounded text-xs text-[var(--text-secondary)]">
                    {explorerData.opening.eco}
                  </span>
                </Card>
              </motion.div>
            )}

            {/* Book Moves */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <h3 className="font-medium text-[var(--text-primary)]">Book Moves</h3>
              </div>

              {explorerLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : explorerData?.moves && explorerData.moves.length > 0 ? (
                <div className="space-y-2">
                  {explorerData.moves.slice(0, 8).map((move, index) => {
                    const total = move.white + move.draws + move.black;
                    const whitePercent = (move.white / total) * 100;
                    const drawPercent = (move.draws / total) * 100;

                    return (
                      <motion.button
                        key={move.uci}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleBookMoveClick(move.san)}
                        className="w-full group"
                      >
                        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] border border-transparent hover:border-indigo-500/30 transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-[var(--text-primary)] font-medium group-hover:text-indigo-400 transition-colors">
                              {move.san}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {total.toLocaleString()} games
                            </span>
                          </div>
                          {/* Win/Draw/Loss bar */}
                          <div className="flex h-1.5 rounded-full overflow-hidden bg-[var(--bg-base)]">
                            <motion.div
                              className="bg-white"
                              initial={{ width: 0 }}
                              animate={{ width: `${whitePercent}%` }}
                              transition={{ delay: 0.2 }}
                            />
                            <motion.div
                              className="bg-gray-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${drawPercent}%` }}
                              transition={{ delay: 0.3 }}
                            />
                            <motion.div
                              className="bg-gray-800"
                              initial={{ width: 0 }}
                              animate={{ width: `${100 - whitePercent - drawPercent}%` }}
                              transition={{ delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-sm">
                  No book moves found for this position
                </p>
              )}
            </Card>

            {/* Saved Openings */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[var(--text-primary)]">Saved Openings</h3>
                <span className="text-sm text-[var(--text-muted)]">
                  {repertoire?.openings?.length || 0}
                </span>
              </div>
              {repertoire?.openings && repertoire.openings.length > 0 ? (
                <div className="space-y-2">
                  {repertoire.openings.map((opening, index) => (
                    <button
                      key={opening.id || index}
                      onClick={() => setSelectedOpening(index)}
                      className={cn(
                        'w-full p-3 rounded-xl text-left transition-all',
                        selectedOpening === index
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
                      )}
                    >
                      <p className="font-medium">{opening.name}</p>
                      <p className="text-xs opacity-75">{opening.eco || 'Custom'}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-sm">No openings saved yet</p>
              )}
            </Card>
          </div>
        </div>
      </PageContainer>

      {/* Add Opening Modal */}
      <Modal
        isOpen={showAddOpening}
        onClose={() => setShowAddOpening(false)}
        title="Save Opening"
      >
        <form onSubmit={handleAddOpening}>
          <Input
            label="Opening Name"
            value={newOpeningName}
            onChange={(e) => setNewOpeningName(e.target.value)}
            placeholder={explorerData?.opening?.name || 'My Opening Line'}
            required
          />

          <div className="mt-4 p-3 bg-[var(--bg-elevated)] rounded-xl">
            <p className="text-sm text-[var(--text-secondary)]">
              Moves: {moveHistory.join(' ')}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddOpening(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
