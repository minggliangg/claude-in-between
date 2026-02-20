import type { Rank, TurnPhase } from '../game/logic';
import { rankLabel } from '../game/logic';

interface PlayingCardProps {
  rank: Rank;
}

function PlayingCard({ rank }: PlayingCardProps) {
  const label = rankLabel(rank);

  return (
    <div style={{
      width: '80px',
      height: '120px',
      borderRadius: '8px',
      background: 'linear-gradient(160deg, #ffffff 0%, #f8f8fa 100%)',
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: 'var(--shadow-card), 0 1px 0 rgba(255,255,255,0.5) inset',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '7px',
      position: 'relative',
      animation: 'card-flip 0.5s ease both',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        lineHeight: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: label.length > 1 ? '0.75rem' : '0.85rem',
          color: '#1a1a2e',
          lineHeight: 1,
        }}>
          {label}
        </span>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: label.length > 1 ? '1.4rem' : '1.8rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color: '#1a1a2e',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {label}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        transform: 'rotate(180deg)',
        lineHeight: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: label.length > 1 ? '0.75rem' : '0.85rem',
          color: '#1a1a2e',
          lineHeight: 1,
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function PlaceholderCard({ subtle }: { subtle?: boolean }) {
  return (
    <div style={{
      width: '80px',
      height: '120px',
      borderRadius: '8px',
      border: '2px dashed rgba(108,99,255,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: subtle ? 0.5 : 1,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}>?</span>
    </div>
  );
}

interface DisplayProps {
  card1Rank: Rank | null;
  card2Rank: Rank | null;
  drawnRank: Rank | null;
  phase: TurnPhase;
}

export default function CardDisplay({ card1Rank, card2Rank, drawnRank, phase }: DisplayProps) {
  const showDrawn = phase === 'result';
  const showDrawPlaceholder = phase === 'drawing';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '20px 16px',
    }}>
      {card1Rank ? <PlayingCard rank={card1Rank} /> : <PlaceholderCard />}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '2px',
          height: '40px',
          background: 'linear-gradient(180deg, transparent, rgba(108,99,255,0.4), transparent)',
        }} />
        {showDrawn && drawnRank ? (
          <PlayingCard rank={drawnRank} />
        ) : showDrawPlaceholder ? (
          <PlaceholderCard />
        ) : (
          <div style={{
            width: '80px',
            height: '120px',
            borderRadius: '8px',
            border: '2px dashed rgba(108,99,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}>Draw</span>
          </div>
        )}
        <div style={{
          width: '2px',
          height: '40px',
          background: 'linear-gradient(180deg, transparent, rgba(108,99,255,0.4), transparent)',
        }} />
      </div>

      {card2Rank ? <PlayingCard rank={card2Rank} /> : <PlaceholderCard subtle={!card1Rank} />}
    </div>
  );
}
