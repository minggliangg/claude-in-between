import { useState } from 'react';

interface Props {
  onStart: (playerNames: string[], anteAmount: number) => void;
}

export default function PlayerSetup({ onStart }: Props) {
  const [names, setNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [anteAmount, setAnteAmount] = useState(1);

  function addPlayer() {
    if (names.length < 10) setNames(n => [...n, `Player ${n.length + 1}`]);
  }

  function removePlayer(i: number) {
    if (names.length > 2) setNames(n => n.filter((_, idx) => idx !== i));
  }

  function updateName(i: number, val: string) {
    setNames(n => n.map((v, idx) => idx === i ? val : v));
  }

  const validNames = names.map(n => n.trim()).filter(Boolean);
  const canStart = validNames.length >= 2 && anteAmount > 0;

  function handleStart() {
    if (!canStart) return;
    const filled = names.map((n, i) => n.trim() || `Player ${i + 1}`);
    onStart(filled, anteAmount);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      padding: '0 0 40px',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '52px 24px 32px',
        borderBottom: '1px solid rgba(108, 99, 255, 0.12)',
        background: 'linear-gradient(180deg, rgba(108,99,255,0.1) 0%, transparent 100%)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: '12px',
          opacity: 0.8,
        }}>
          CNY · 2026
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 2.8rem)',
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1.1,
          margin: '0 0 6px',
          letterSpacing: '-0.01em',
        }}>
          In Between
        </h1>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: 'var(--accent)',
          opacity: 0.7,
        }}>
          Physical Card Tracker
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '20px',
          fontSize: '1.1rem',
          opacity: 0.35,
          color: 'var(--text)',
        }}>
          <span style={{ color: 'var(--crimson-light)' }}>♥</span>
          <span>♠</span>
          <span style={{ color: 'var(--crimson-light)' }}>♦</span>
          <span>♣</span>
        </div>
      </div>

      <div style={{ padding: '28px 20px', flex: 1 }}>
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '10px',
          }}>
            Ante Per Round
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              pointerEvents: 'none',
            }}>$</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={anteAmount}
              onChange={e => setAnteAmount(Math.max(1, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '14px 16px 14px 28px',
                background: 'var(--glass-bg)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(108,99,255,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}>
              Players ({names.length}/10)
            </label>
            {names.length < 10 && (
              <button
                onClick={addPlayer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  opacity: 0.8,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
              >
                + Add Player
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {names.map((name, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  animation: 'slide-up 0.3s ease',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--surface-2)',
                  border: 'var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--accent-dim)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <input
                  type="text"
                  placeholder={`Player ${i + 1}`}
                  value={name}
                  maxLength={20}
                  onChange={e => updateName(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && i === names.length - 1 && addPlayer()}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    background: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(108,99,255,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                {names.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      padding: '4px',
                      lineHeight: 1,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--crimson-light)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '12px 14px',
          background: 'rgba(108,99,255,0.06)',
          border: 'var(--border-gold)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '28px',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
          }}>
            Each player pays ${anteAmount} per round.
            Starting pot: <span style={{ color: 'var(--accent-light)' }}>${names.length * anteAmount}</span>
          </p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={!canStart}
          style={{ width: '100%', fontSize: '1.1rem' }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
