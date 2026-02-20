import { useState, useRef, useEffect } from 'react';
import type { Rank, Player, Decision } from '../game/logic';
import { isMandatoryPass } from '../game/logic';
import type { TurnState } from '../App';
import CardDisplay from './CardDisplay';
import DecisionPanel from './DecisionPanel';
import PlayerList from './PlayerList';
import RankPicker from './RankPicker';

interface Props {
  players: Player[];
  pot: number;
  currentPlayerIndex: number;
  currentPlayer: Player;
  turn: TurnState | null;
  decision: Decision | null;
  usedRanks: Rank[];
  onSelectDrawnCard: (rank: Rank) => void;
  onPass: () => void;
  onBet: (amount: number) => void;
  onNextTurn: () => void;
  onBetChange: (amount: number) => void;
  onExitToSetup: () => void;
}

function ResultOverlay({ outcome }: { outcome: 'win' | 'loss' | 'post' }) {
  const config = {
    win:  { label: 'WIN!',  sub: 'Pot pays out',      color: '#00d2a3', anim: 'result-flash-win' },
    loss: { label: 'LOSS',  sub: 'Pay into the pot',  color: '#ff4d6a', anim: 'result-flash-loss' },
    post: { label: 'POST!', sub: 'Double penalty',    color: '#ffb300', anim: 'result-flash-post' },
  }[outcome];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `${config.anim} 0.8s ease forwards`,
        pointerEvents: 'none',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 18vw, 5rem)',
        fontWeight: 700,
        color: config.color,
        letterSpacing: '-0.02em',
        textShadow: `0 0 40px ${config.color}80`,
        animation: 'slide-up 0.3s ease',
        lineHeight: 1,
      }}>
        {config.label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: config.color,
        opacity: 0.7,
        marginTop: '10px',
      }}>
        {config.sub}
      </div>
    </div>
  );
}

export default function GameBoard({
  players, pot, currentPlayerIndex, currentPlayer, turn,
  decision, usedRanks,
  onSelectDrawnCard,
  onPass, onBet, onNextTurn, onBetChange,
  onExitToSetup,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const prevOutcomeRef = useRef<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimerRef = useRef<number | null>(null);

  const phase = turn?.phase ?? 'betting';
  const outcome = turn?.outcome ?? null;

  useEffect(() => {
    if (outcome === prevOutcomeRef.current) return;
    prevOutcomeRef.current = outcome;

    if (phase === 'result' && outcome && outcome !== 'pass') {
      if (overlayTimerRef.current !== null) {
        clearTimeout(overlayTimerRef.current);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOverlay(true);
      overlayTimerRef.current = window.setTimeout(() => {
        setShowOverlay(false);
        overlayTimerRef.current = null;
      }, 1200);
    }

    return () => {
      if (overlayTimerRef.current !== null) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
    };
  }, [phase, outcome]);

  const isMustPass = turn && turn.card1Rank && turn.card2Rank && phase === 'betting'
    ? isMandatoryPass(turn.card1Rank, turn.card2Rank)
    : false;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      position: 'relative',
    }}>
      {showOverlay && outcome && outcome !== 'pass' && (
        <ResultOverlay outcome={outcome} />
      )}

      {showMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            animation: 'fade-in 0.2s ease',
          }}
          onClick={() => setShowMenu(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              background: 'var(--glass-bg)',
              borderRadius: '16px 16px 0 0',
              border: 'var(--glass-border)',
              borderBottom: 'none',
              padding: '20px',
              animation: 'slide-up 0.3s ease',
              backdropFilter: 'var(--glass-blur)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--text)',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              Game Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-danger"
                style={{ width: '100%' }}
                onClick={() => { onExitToSetup(); setShowMenu(false); }}
              >
                Exit to Setup
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setShowMenu(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(108,99,255,0.1)',
        background: 'rgba(15,15,19,0.6)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ width: '40px' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '2px',
          }}>
            Pot
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--accent-light)',
            lineHeight: 1,
            textShadow: '0 0 20px rgba(108,99,255,0.4)',
            letterSpacing: '-0.02em',
          }}>
            ${pot}
          </div>
        </div>

        <button
          onClick={() => setShowMenu(true)}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'var(--text-dim)',
            padding: '6px 10px',
            fontSize: '0.8rem',
            lineHeight: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '40px',
          }}
        >
          ···
        </button>
      </div>

      <div style={{
        padding: '12px 20px 4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent)',
          flexShrink: 0,
          animation: 'float 2s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          color: 'var(--text)',
          fontWeight: 600,
        }}>
          {currentPlayer?.name}
        </span>
      </div>

      {turn && (
        <CardDisplay
          card1Rank={turn.card1Rank}
          card2Rank={turn.card2Rank}
          drawnRank={turn.drawnRank}
          phase={phase}
        />
      )}

      <div className="gold-divider" style={{ margin: '0 20px' }} />

      {decision && turn && phase === 'betting' && (
        <div style={{ padding: '14px 0 0' }}>
          <DecisionPanel
            decision={decision}
            pot={pot}
            betAmount={turn.betAmount}
            onBetChange={onBetChange}
            phase={phase}
          />
        </div>
      )}

      {phase === 'drawing' && turn && (
        <div style={{ padding: '14px 0 0' }}>
          <RankPicker
            label="Select Drawn Card"
            usedRanks={usedRanks}
            selectedRank={null}
            onSelect={onSelectDrawnCard}
          />
        </div>
      )}

      {phase === 'result' && turn?.drawnRank && (
        <div style={{
          margin: '14px 16px 0',
          padding: '14px 16px',
          borderRadius: '8px',
          background: outcome === 'win'
            ? 'rgba(0,210,163,0.15)'
            : outcome === 'post'
            ? 'rgba(255,179,0,0.15)'
            : 'rgba(255,77,106,0.12)',
          border: outcome === 'win'
            ? '1px solid rgba(0,210,163,0.3)'
            : outcome === 'post'
            ? '1px solid rgba(255,179,0,0.3)'
            : '1px solid rgba(255,77,106,0.3)',
          animation: 'slide-up 0.3s ease',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            color: outcome === 'win'
              ? '#00d2a3'
              : outcome === 'post'
              ? '#ffb300'
              : '#ff4d6a',
            marginBottom: '4px',
          }}>
            {outcome === 'win' ? `Won $${turn.betAmount} from pot` : outcome === 'post' ? `Paid $${turn.betAmount * 2} to pot (post)` : `Lost $${turn.betAmount} to pot`}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
          }}>
            Pot now: ${pot}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '16px 16px 20px' }}>
        {phase === 'betting' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, minHeight: '56px' }}
              onClick={onPass}
            >
              Pass (+$1)
            </button>
            <button
              className="btn-primary"
              style={{ flex: 2, minHeight: '56px', opacity: isMustPass ? 0.3 : 1 }}
              onClick={() => !isMustPass && onBet(turn!.betAmount)}
              disabled={isMustPass || pot < 1}
            >
              {isMustPass ? 'Must Pass' : `Bet $${turn?.betAmount ?? 1}`}
            </button>
          </div>
        )}

        {phase === 'result' && (
          <button
            className="btn-primary"
            style={{ width: '100%', minHeight: '56px' }}
            onClick={onNextTurn}
          >
            Next Turn
          </button>
        )}
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(15,15,19,0.8)',
      }}>
        <PlayerList players={players} currentPlayerIndex={currentPlayerIndex} />
      </div>
    </div>
  );
}
