import type { Decision, TurnPhase } from '../game/logic';

interface Props {
  decision: Decision;
  pot: number;
  betAmount: number;
  onBetChange: (amount: number) => void;
  phase: TurnPhase;
}

export default function DecisionPanel({ decision, pot, betAmount, onBetChange, phase }: Props) {

  if (phase === 'result') return null;

  const pct = Math.round(decision.probability * 100);
  const maxBet = pot;

  const actionColor = decision.action === 'MUST_PASS'
    ? 'var(--accent)'
    : decision.action === 'BET'
    ? '#00d2a3'
    : 'var(--crimson-light)';

  const actionLabel = decision.action === 'MUST_PASS'
    ? 'Must Pass'
    : decision.action === 'BET'
    ? 'Bet'
    : 'Pass';

  const showSlider = decision.action !== 'MUST_PASS' && phase === 'betting';

  return (
    <div style={{
      margin: '0 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--glass-bg)',
      border: 'var(--glass-border)',
      overflow: 'hidden',
      animation: 'slide-up 0.35s ease',
      backdropFilter: 'var(--glass-blur)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '4px 10px',
            borderRadius: '3px',
            background: decision.action === 'MUST_PASS'
              ? 'rgba(108,99,255,0.15)'
              : decision.action === 'BET'
              ? 'rgba(0,210,163,0.15)'
              : 'rgba(255,77,106,0.12)',
            border: `1px solid ${actionColor}40`,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: actionColor,
          }}>
            {actionLabel}
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.05em',
          }}>
            Recommendation
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1rem',
          fontWeight: 500,
          color: actionColor,
        }}>
          {pct}%
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{
          height: '5px',
          borderRadius: '3px',
          background: 'var(--surface-2)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '3px',
            background: decision.action === 'BET'
              ? 'linear-gradient(90deg, #00a080, #00d2a3)'
              : decision.action === 'MUST_PASS'
              ? 'linear-gradient(90deg, var(--accent-dim), var(--accent))'
              : 'linear-gradient(90deg, var(--crimson-dim), var(--crimson))',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          marginTop: '8px',
          lineHeight: 1.4,
        }}>
          {decision.reasoning}
        </p>
      </div>

      {showSlider && maxBet > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              Bet Amount
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                onClick={() => onBetChange(Math.max(1, betAmount - 1))}
                disabled={betAmount <= 1}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--surface-2)',
                  border: 'var(--glass-border)',
                  color: betAmount <= 1 ? 'var(--text-dim)' : 'var(--text)',
                  fontSize: '1.2rem',
                  cursor: betAmount <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--accent)',
                fontWeight: 500,
                minWidth: '48px',
                textAlign: 'center',
              }}>
                ${betAmount}
              </div>
              <button
                onClick={() => onBetChange(Math.min(maxBet, betAmount + 1))}
                disabled={betAmount >= maxBet}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--surface-2)',
                  border: 'var(--glass-border)',
                  color: betAmount >= maxBet ? 'var(--text-dim)' : 'var(--text)',
                  fontSize: '1.2rem',
                  cursor: betAmount >= maxBet ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            {[
              { label: '2', val: 2 },
              { label: '5', val: 5 },
              { label: '10', val: 10 },
              { label: '1/4', val: Math.max(1, Math.floor(pot / 4)) },
              { label: '1/2', val: Math.max(1, Math.floor(pot / 2)) },
              { label: '3/4', val: Math.max(1, Math.floor(pot * 3 / 4)) },
              { label: 'Pot', val: pot },
              ...(decision.suggestedBet > 0 && ![2, 5, 10, Math.floor(pot/4), Math.floor(pot/2), Math.floor(pot*3/4), pot].includes(decision.suggestedBet) 
                ? [{ label: `Sug`, val: decision.suggestedBet }] : []),
            ].filter(({ val }) => val <= maxBet).map(({ label, val }) => (
              <button
                key={label}
                onClick={() => onBetChange(val)}
                style={{
                  flex: 1,
                  minWidth: '60px',
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: betAmount === val ? 'var(--accent)' : 'var(--surface-2)',
                  border: betAmount === val ? 'none' : 'var(--glass-border)',
                  color: betAmount === val ? 'white' : 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}<br/>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>${val}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
