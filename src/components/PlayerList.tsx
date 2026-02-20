import type { Player } from '../game/logic';

interface Props {
  players: Player[];
  currentPlayerIndex: number;
}

export default function PlayerList({ players, currentPlayerIndex }: Props) {
  return (
    <div style={{
      overflowX: 'auto',
      padding: '12px 16px',
      display: 'flex',
      gap: '10px',
      scrollbarWidth: 'none',
    }}>
      {players.map((player, i) => {
        const isCurrent = i === currentPlayerIndex;
        return (
          <div
            key={player.id}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: '20px',
              background: isCurrent ? 'rgba(108,99,255,0.12)' : 'var(--glass-bg)',
              border: isCurrent
                ? '1px solid rgba(108,99,255,0.6)'
                : 'var(--glass-border)',
              boxShadow: isCurrent ? 'var(--shadow-gold)' : 'none',
              transition: 'all 0.3s ease',
              animation: isCurrent ? 'pulse-gold 2s ease-in-out infinite' : 'none',
              backdropFilter: isCurrent ? 'var(--glass-blur)' : 'none',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              color: isCurrent ? 'var(--text)' : 'var(--text-dim)',
              whiteSpace: 'nowrap',
            }}>
              {player.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
