interface Props {
  pot: number;
  anteAmount: number;
  playerCount: number;
  onConfirm: () => void;
}

export default function NewRoundOverlay({ pot, anteAmount, playerCount, onConfirm }: Props) {
  const newPot = pot + anteAmount * playerCount;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)',
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'slide-up 0.35s ease',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--accent-dim)',
          marginBottom: '12px',
        }}>
          Round Complete
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 8vw, 2.4rem)',
          fontWeight: 700,
          color: 'var(--text)',
          margin: '0 0 24px',
        }}>
          New Round
        </h2>
        <div style={{
          padding: '20px 24px',
          background: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          backdropFilter: 'var(--glass-blur)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            marginBottom: '8px',
          }}>
            Each player antes <span style={{ color: 'var(--accent-light)' }}>${anteAmount}</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'var(--accent-light)',
          }}>
            ${newPot}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            marginTop: '4px',
          }}>
            New pot total
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={onConfirm}
          style={{ minWidth: '200px', fontSize: '1rem' }}
        >
          Start New Round
        </button>
      </div>
    </div>
  );
}
