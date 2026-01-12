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
      <div className="u-min-h-screen u-flex u-items-center u-justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="u-min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      <Header
        title={repertoire?.name}
        subtitle={`${repertoire?.color === 'white' ? '♔ White' : '♚ Black'} Repertoire`}
        backTo="/"
      />

      <PageContainer>
        <div className="repertoire-editor" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Chess Board */}
          <div style={{ gridColumn: 'span 1' }} className="u-lg-col-span-2">
            <Card padding="none" style={{ overflow: 'hidden' }}>
              {/* Board container with subtle glow */}
              <div style={{ padding: '1.5rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)' }}>
                <div style={{ maxWidth: '32rem', margin: '0 auto', position: 'relative' }}>
                  {/* Glow effect behind board */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                    filter: 'blur(48px)',
                    zIndex: -1,
                  }} />

                  <div style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
              <div style={{ padding: '0 1.5rem 1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0}
                  leftIcon={<RotateCcw style={{ width: '1rem', height: '1rem' }} />}
                >
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  leftIcon={<RefreshCw style={{ width: '1rem', height: '1rem' }} />}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddOpening(true)}
                  disabled={moveHistory.length === 0}
                  leftIcon={<Save style={{ width: '1rem', height: '1rem' }} />}
                >
                  Save Opening
                </Button>
              </div>

              {/* Move history */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.75rem' }}>
                  Current Line
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {moveHistory.length === 0 ? (
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                      Make moves on the board to build your repertoire
                    </span>
                  ) : (
                    moveHistory.map((move, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                      >
                        {index % 2 === 0 && (
                          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginRight: '0.25rem' }}>
                            {Math.floor(index / 2) + 1}.
                          </span>
                        )}
                        <span style={{
                          backgroundColor: 'rgba(99, 102, 241, 0.2)',
                          color: '#00f0ff',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontFamily: 'Share Tech Mono, monospace',
                        }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Opening Info */}
            {explorerData?.opening && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card padding="sm">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: '#00f0ff' }} />
                    <h3 style={{ fontWeight: 500, color: 'white' }}>
                      Current Opening
                    </h3>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {explorerData.opening.name}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}>
                    {explorerData.opening.eco}
                  </span>
                </Card>
              </motion.div>
            )}

            {/* Book Moves */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Lightbulb style={{ width: '1.25rem', height: '1.25rem', color: '#ffaa00' }} />
                <h3 style={{ fontWeight: 500, color: 'white' }}>Book Moves</h3>
              </div>

              {explorerLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                  <Spinner size="sm" />
                </div>
              ) : explorerData?.moves && explorerData.moves.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '1rem',
                          backgroundColor: '#1a1a2e',
                          border: '1px solid transparent',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontFamily: 'Share Tech Mono, monospace', color: 'white', fontWeight: 500 }}>
                              {move.san}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                              {total.toLocaleString()} games
                            </span>
                          </div>
                          {/* Win/Draw/Loss bar */}
                          <div style={{ display: 'flex', height: '6px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: '#0a0a0f' }}>
                            <motion.div
                              style={{ backgroundColor: 'white' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${whitePercent}%` }}
                              transition={{ delay: 0.2 }}
                            />
                            <motion.div
                              style={{ backgroundColor: 'gray' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${drawPercent}%` }}
                              transition={{ delay: 0.3 }}
                            />
                            <motion.div
                              style={{ backgroundColor: '#1a1a1a' }}
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
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                  No book moves found for this position
                </p>
              )}
            </Card>

            {/* Saved Openings */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 500, color: 'white' }}>Saved Openings</h3>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {repertoire?.openings?.length || 0}
                </span>
              </div>
              {repertoire?.openings && repertoire.openings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {repertoire.openings.map((opening, index) => (
                    <button
                      key={opening.id || index}
                      onClick={() => setSelectedOpening(index)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedOpening === index ? '#00f0ff' : '#1a1a2e',
                        color: selectedOpening === index ? 'white' : 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <p style={{ fontWeight: 500 }}>{opening.name}</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.75 }}>{opening.eco || 'Custom'}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>No openings saved yet</p>
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

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#1a1a2e',
            borderRadius: '1rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Moves: {moveHistory.join(' ')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setShowAddOpening(false)}
              className="u-flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} className="u-flex-1">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
