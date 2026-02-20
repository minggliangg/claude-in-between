import type { Rank, Player } from '../game/logic';
import RankPicker from './RankPicker';
import type { DealingStep } from '../App';

interface Props {
  players: Player[];
  dealingStep: DealingStep;
  usedRanks: Rank[];
  onDealCard1: (rank: Rank) => void;
  onDealCard2: (rank: Rank) => void;
  onExitToSetup: () => void;
}

export default function DealingPhase({ players, dealingStep, usedRanks, onDealCard1, onDealCard2, onExitToSetup }: Props) {
  const currentPlayer = players[dealingStep.playerIndex];
  const totalPlayers = players.length;
  const playerNum = dealingStep.playerIndex + 1;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
    }}>
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
        <button
          onClick={onExitToSetup}
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
          }}
        >
          Exit
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '2px',
          }}>
            Dealing Phase
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1,
          }}>
            Player {playerNum} of {totalPlayers}
          </div>
        </div>

        <div style={{ width: '50px' }} />
      </div>

      <div style={{
        padding: '24px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '8px',
        }}>
          {currentPlayer?.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.05em',
        }}>
          Enter their two cards
        </div>
      </div>

      <div style={{ padding: '0 0 24px' }}>
        {dealingStep.card1 === null ? (
          <RankPicker
            label="Card 1"
            usedRanks={usedRanks}
            selectedRank={null}
            onSelect={onDealCard1}
          />
        ) : (
          <RankPicker
            label="Card 2"
            usedRanks={usedRanks}
            selectedRank={dealingStep.card1}
            onSelect={onDealCard2}
          />
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {players.map((_, i) => (
            <div
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: i < dealingStep.playerIndex
                  ? 'var(--accent)'
                  : i === dealingStep.playerIndex
                  ? 'var(--accent-light)'
                  : 'rgba(255,255,255,0.1)',
                boxShadow: i === dealingStep.playerIndex
                  ? '0 0 8px var(--accent)'
                  : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
