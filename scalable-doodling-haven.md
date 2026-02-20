# Plan: In Between — 3 Game Changes

## Context
The "In Between" physical card tracker app needs three changes:
1. Deck is reshuffled (usedRanks cleared) at the start of each new round
2. A new dealing phase: all players' two cards are entered upfront before anyone bets
3. A full modern design overhaul replacing the dark crimson/gold casino aesthetic

---

## Change 1 — Reshuffle deck each round

**File:** `src/App.tsx:164` — `handleConfirmNewRound`

Add `usedRanks: []` to the returned state update. Currently `usedRanks` persists across rounds; this one-line fix resets it.

Also add `usedRanks: []` to `handleExitToSetup` for full cleanup.

---

## Change 2 — Pre-deal all players before first player bets

### State changes (`src/App.tsx`)

```typescript
// New export
export interface DealingStep {
  playerIndex: number;
  card1: Rank | null;
}

// Updated AppState
interface AppState {
  screen: 'setup' | 'dealing' | 'game' | 'newRound';  // add 'dealing'
  // ... existing fields ...
  dealtHands: ([Rank, Rank] | null)[];  // indexed by player
  dealingStep: DealingStep;
}
```

Initial state gets `dealtHands: []` and `dealingStep: { playerIndex: 0, card1: null }`.

### `createFreshTurn` → requires card params, starts at `'betting'`
```typescript
function createFreshTurn(card1: Rank, card2: Rank): TurnState {
  return { card1Rank: card1, card2Rank: card2, drawnRank: null, betAmount: 1, phase: 'betting', outcome: null };
}
```

### Handler changes

| Handler | Change |
|---|---|
| `handleStart` | Goes to `'dealing'` screen; initializes `dealtHands: players.map(() => null)`, `dealingStep: { playerIndex: 0, card1: null }` |
| `handleDealCard1(rank)` | New — adds rank to `usedRanks`, sets `dealingStep.card1 = rank` |
| `handleDealCard2(rank)` | New — adds rank to `usedRanks`, stores `dealtHands[playerIndex] = [card1, rank]`; if last player: → `'game'` with `turn = createFreshTurn(dealtHands[0])`, else advance `dealingStep.playerIndex` |
| `handleConfirmNewRound` | Goes to `'dealing'` (not `'game'`); resets `usedRanks: []`, `dealtHands`, `dealingStep` |
| `handleNextTurn` | Uses `dealtHands[nextIndex]!` to build next turn via `createFreshTurn` |
| `handlePass` | Does NOT add card1/card2 to usedRanks (already done during dealing); uses `dealtHands[nextIndex]!` |
| `handleSelectDrawnCard` | Only adds `drawnRank` to `usedRanks` (not card1/card2 — already added during dealing) |
| `handleExitToSetup` | Resets `dealtHands: []`, `dealingStep`, `usedRanks: []` |
| `handleSelectCard1/2` | **Delete** — no longer used |

### New component: `src/components/DealingPhase.tsx`
```typescript
interface Props {
  players: Player[];
  dealingStep: DealingStep;
  usedRanks: Rank[];
  onDealCard1: (rank: Rank) => void;
  onDealCard2: (rank: Rank) => void;
}
```
- If `dealingStep.card1 === null`: renders `<RankPicker label="Card 1" ...onSelect={onDealCard1} />`
- If card1 set: renders `<RankPicker label="Card 2" selectedRank={card1} ...onSelect={onDealCard2} />`
- Shows progress: `"Player {n+1} of {total}"` and current player name

### `src/components/GameBoard.tsx`
- Remove `onSelectCard1` / `onSelectCard2` from Props interface
- Delete the `phase === 'input'` block (lines 263–281)
- Change `const phase = turn?.phase ?? 'input'` → `?? 'betting'`

### `src/game/logic.ts`
- Remove `'input'` from `TurnPhase` union: `'betting' | 'drawing' | 'result'`

### `src/components/DecisionPanel.tsx`
- Line 15: remove `|| phase === 'input'` from the early-return guard

### App render — add dealing screen:
```tsx
if (state.screen === 'dealing') {
  return <DealingPhase players={state.players} dealingStep={state.dealingStep}
    usedRanks={state.usedRanks} onDealCard1={handleDealCard1} onDealCard2={handleDealCard2} />;
}
```
Remove `onSelectCard1` / `onSelectCard2` from `<GameBoard>` JSX.

---

## Change 3 — Modern design overhaul

### Font (`src/index.css`)
Replace `Playfair Display` with `Inter`. Keep `DM Mono` for numbers.
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
```

### CSS variable replacement (`:root` block)
- Background: `#0f0f13` (near-black blue-black)
- Surfaces: glass-morphism `rgba(255,255,255,0.04)` / `0.07`
- Accent: electric indigo `#6c63ff` with light `#9d97ff`
- Win: teal `#00d2a3` | Loss: `#ff4d6a` | Post: `#ffb300`
- Text: `#f0f0f5` / dim `#9090a8` / muted `#55556a`
- Add glass helpers: `--glass-bg`, `--glass-border`, `--glass-blur: blur(12px)`
- Keep `--gold`/`--crimson` aliases pointing to new accent/loss vars so remaining inline styles still work during migration

### Body background
Replace crimson gradient with:
```css
radial-gradient(ellipse 80% 50% at 50% -5%, rgba(108,99,255,0.12) 0%, transparent 60%),
radial-gradient(ellipse 50% 40% at 90% 110%, rgba(0,210,163,0.06) 0%, transparent 50%)
```

### Buttons
- `.btn-primary`: indigo gradient, white text, indigo shadow
- `.btn-secondary`: indigo border, rounded corners
- `.btn-danger`: red border, no background
- All `border-radius` → `var(--radius-sm)` = `8px`

### Keyframes — update flash colors
- `result-flash-win`: `rgba(0,210,163,...)` | `result-flash-loss`: `rgba(255,77,106,...)` | `result-flash-post`: `rgba(255,179,0,...)`
- `pulse-gold`: `rgba(108,99,255,...)`
- `.gold-divider`: center color → `rgba(108,99,255,0.4)`

### Per-component inline style updates
All components use inline styles. Key substitutions throughout:
- `rgba(212,160,23,...)` (old gold) → `rgba(108,99,255,...)` (indigo)
- `rgba(192,39,45,...)` (old crimson) → `rgba(255,77,106,...)` (loss red)
- `var(--gold)` → `var(--accent)` | `var(--gold-light)` → `var(--accent-light)`
- `var(--surface)` → `var(--glass-bg)` + add `backdropFilter: 'var(--glass-blur)'` on card-like containers
- Result states: win → teal (`#00d2a3`), loss → red (`#ff4d6a`), post → amber (`#ffb300`)
- `PlayingCard` face: brighter white `#ffffff→#f8f8fa` gradient, deeper shadow (`var(--shadow-card)`)
- `ResultOverlay` win/loss/post colors updated to new semantic vars
- PlayerList active pill: indigo background/border/shadow
- PlayerSetup hero gradient: crimson → indigo

---

## Files Modified/Created

| File | Type |
|---|---|
| `src/App.tsx` | modify |
| `src/game/logic.ts` | modify (TurnPhase) |
| `src/index.css` | modify (full overhaul) |
| `src/components/DealingPhase.tsx` | **create** |
| `src/components/GameBoard.tsx` | modify |
| `src/components/CardDisplay.tsx` | modify (design) |
| `src/components/DecisionPanel.tsx` | modify |
| `src/components/PlayerList.tsx` | modify (design) |
| `src/components/PlayerSetup.tsx` | modify (design) |
| `src/components/RankPicker.tsx` | modify (design) |
| `src/components/NewRoundOverlay.tsx` | modify (design) |

---

## Verification
1. `bun run dev` — start dev server
2. Setup 3 players, ante $2
3. Dealing screen appears — enter card1+card2 for each player sequentially
4. After all 3 players dealt, game screen shows Player 1 already at betting phase with their cards shown
5. Bet, draw, advance through all 3 players
6. New Round overlay appears → confirm → dealing screen reappears (fresh deck, `usedRanks = []`)
7. `bun run build` — ensure TypeScript compilation succeeds (no `'input'` phase references remaining)
