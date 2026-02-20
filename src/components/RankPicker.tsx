import type { Rank } from '../game/logic';
import { rankLabel, rankUsedCount } from '../game/logic';

const ALL_RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

interface Props {
  label: string;
  usedRanks: Rank[];
  selectedRank: Rank | null;
  onSelect: (r: Rank) => void;
}

export default function RankPicker({ label, usedRanks, selectedRank, onSelect }: Props) {
  return (
    <div style={{ margin: '0 16px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        marginBottom: '10px',
      }}>
        {label}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
      }}>
        {ALL_RANKS.map(rank => {
          const usedCount = rankUsedCount(rank, usedRanks);
          const isFullyUsed = usedCount >= 4;
          const isSelected = selectedRank === rank;
          return (
            <button
              key={rank}
              onClick={() => !isFullyUsed && onSelect(rank)}
              disabled={isFullyUsed}
              style={{
                height: '56px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected
                  ? '2px solid var(--accent)'
                  : 'var(--glass-border)',
                background: isSelected
                  ? 'rgba(108,99,255,0.15)'
                  : 'var(--glass-bg)',
                color: isFullyUsed
                  ? 'var(--text-muted)'
                  : isSelected
                  ? 'var(--accent-light)'
                  : 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: rank === 10 ? '1rem' : '1.1rem',
                fontWeight: isSelected ? 600 : 500,
                cursor: isFullyUsed ? 'not-allowed' : 'pointer',
                opacity: isFullyUsed ? 0.4 : 1,
                transition: 'all 0.2s',
                position: 'relative',
                boxShadow: isSelected ? 'var(--shadow-gold)' : 'none',
              }}
            >
              {rankLabel(rank)}
              {usedCount > 0 && !isFullyUsed && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '0.55rem',
                  color: 'var(--text-dim)',
                }}>
                  {4 - usedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
