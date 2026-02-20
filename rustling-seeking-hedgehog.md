# In-Between CNY Card Game — Implementation Plan

## Context
Build a mobile-first SPA to track the "In-Between" card game played during CNY. The app needs to manage players, deck, pot, and provide a decision recommendation (bet or pass) with win probability and suggested bet amount. Aesthetic: luxury CNY casino — deep crimson + gold on near-black, Playfair Display + DM Mono fonts.

---

## State Shape (in App.tsx)

```typescript
// src/game/logic.ts — types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 1|2|3|4|5|6|7|8|9|10|11|12|13; // A=1, J=11, Q=12, K=13
interface Card { rank: Rank; suit: Suit; }
interface Player { id: string; name: string; balance: number; }
type TurnPhase = 'dealing' | 'betting' | 'drawing' | 'result' | 'passed';

// App.tsx state
{
  screen: 'setup' | 'game';
  players: Player[];
  pot: number;
  deck: Card[];               // remaining undealt cards
  currentPlayerIndex: number;
  turn: {
    card1: Card; card2: Card;
    drawnCard: Card | null;
    betAmount: number;
    phase: TurnPhase;
    outcome: 'win' | 'loss' | 'post' | 'pass' | null;
  } | null;
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/game/logic.ts` | **Create** — all pure game logic |
| `src/App.tsx` | **Replace** — state + handlers + screen router |
| `src/index.css` | **Replace** — full CNY theme |
| `src/App.css` | **Replace** — strip to near-empty |
| `src/components/PlayerSetup.tsx` | **Create** |
| `src/components/GameBoard.tsx` | **Create** |
| `src/components/CardDisplay.tsx` | **Create** |
| `src/components/DecisionPanel.tsx` | **Create** |
| `src/components/PlayerList.tsx` | **Create** |

No new npm packages needed — pure React + CSS.

---

## Pure Logic (src/game/logic.ts)

Key exports:
- `createDeck()` → 52 Card[]
- `shuffleDeck(deck)` → Card[] (Fisher-Yates)
- `rankValue(rank)` → number
- `rankLabel(rank)` → 'A'|'2'...'10'|'J'|'Q'|'K'
- `isMandatoryPass(c1, c2)` → true if same rank OR consecutive ranks
- `getLowHigh(c1, c2)` → [low, high] rank values
- `calcProbability(c1, c2, remainingDeck)` → 0–1 (remaining cards strictly between / deck.length)
- `getDecision(c1, c2, remainingDeck, pot)` → `{ action: 'MUST_PASS'|'BET'|'PASS', probability, suggestedBet, reasoning }`
  - BET when P ≥ 0.5; suggestedBet = min(pot, round(pot × P))
- `determineOutcome(drawn, c1, c2)` → 'win'|'loss'|'post'
- `calcPotDelta(outcome|'pass', bet)` → pot change (win: -bet, loss: +bet, post: +2×bet, pass: +1)

---

## App.tsx Handlers

- `handleStart(players)` — init deck (shuffle), pot = player_count × $1, first turn
- `handlePass()` — pot += 1, next player
- `handleBet(amount)` — lock bet, phase → 'drawing'
- `handleDraw()` — pop card from deck, determineOutcome, update pot + balance, phase → 'result'
- `handleNextTurn()` — advance player index, pop 2 cards, new turn state; if pot ≤ 0 trigger empty pot rule
- `handleNewGame()` — fresh deck + pot, keep player names, reset balances OR carry over (carry over)
- Empty pot check: after every pot mutation, if pot ≤ 0 → all players pay $1 → pot += player_count

---

## Component Designs

### PlayerSetup
- CNY title header, subtitle "Add Players"
- Shared starting balance input (default $20)
- Player name list with add/remove, min 2 max 10
- Large gold "Start Game" button

### GameBoard (layout shell)
```
[Header: pot amount — prominent gold]
[CardDisplay: card1 | card2 | drawn]
[DecisionPanel: recommendation + bet slider]
[Action buttons: PASS | BET → DRAW]
[PlayerList: horizontal scroll chips]
[Result overlay: full-screen flash on outcome]
```

### CardDisplay
- Pure CSS playing cards ~80×120px
- Unicode suits: ♠♣♥♦ (red for ♥♦, dark for ♠♣)
- Rank labels: A, 2–10, J, Q, K
- CSS 3D flip animation (rotateY) for drawn card reveal
- Face-down back: crimson pattern

### DecisionPanel
- Badge: MUST PASS (gold) / BET (green-gold) / PASS (muted red)
- Probability bar + percentage
- Reasoning text: "14 of 22 cards between 4 and J"
- Bet slider (range input) when applicable: min=$1, max=min(pot, playerBalance)
- Hidden during result/passed phase

### PlayerList
- Horizontal scroll row of player chips
- Current player: gold ring highlight
- Balance in DM Mono; negative = red

---

## CSS Theme (src/index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
:root {
  --bg: #0d0d0d;
  --surface: #1a0a0a;
  --surface-2: #261010;
  --crimson: #c0272d;
  --crimson-light: #e8474d;
  --gold: #d4a017;
  --gold-light: #f0c040;
  --gold-dim: #8a6a10;
  --text: #f5e6c8;
  --text-dim: #a08060;
  --win: #2d7a3a;
  --loss: #c0272d;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-mono: 'DM Mono', monospace;
}
```
- Body: dark crimson radial gradient, no overflow-x
- `#root` max-width 480px, centered
- Buttons: min-height 56px (touch target), `.btn-primary` gold gradient, `.btn-secondary` bordered
- Animations: `card-flip` (rotateY), `result-flash-win` (green), `result-flash-loss` (red), `slide-up`

---

## Turn Phase State Machine

```
START TURN: deal 2 cards → phase: 'dealing' → (500ms) → 'betting'
BETTING: show DecisionPanel + slider + PASS/BET buttons
  PASS → pot+=1, next turn (phase: 'passed')
  BET → lock amount, phase: 'drawing'
DRAWING: show "Draw Card" button
  DRAW → pop card, determineOutcome, update balances, phase: 'result'
RESULT: card flip animation, overlay flash, "Next Turn" button
```

---

## Edge Cases
- **Empty pot**: check after every mutation; all players pay $1
- **Negative balance**: allowed, shown in red
- **Deck exhaustion**: reshuffle fresh 52-card deck
- **Mandatory pass**: disabled BET button, auto-show MUST PASS in DecisionPanel
- **Bet max**: min(pot, currentPlayer.balance)

---

## Build Order
1. `src/game/logic.ts` — pure logic first
2. `src/index.css` — theme foundation
3. `src/App.tsx` — state + handlers
4. `src/components/PlayerSetup.tsx`
5. `src/components/CardDisplay.tsx`
6. `src/components/DecisionPanel.tsx`
7. `src/components/PlayerList.tsx`
8. `src/components/GameBoard.tsx` — compose all

---

## Verification
1. `bun run dev` — app loads, no TS errors
2. Add 2+ players → Start Game → see GameBoard
3. Play through a full turn: deal → decision shown → bet → draw → result
4. Verify mandatory pass triggers correctly (deal two 5s, or a 3 and 4)
5. Win scenario: confirm pot decreases by bet
6. Post scenario: confirm pot increases by 2× bet
7. Empty pot: trigger and confirm all players pay $1
8. `bun run build` — no type errors
