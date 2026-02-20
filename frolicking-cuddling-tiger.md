# Plan: Convert to Physical Card Tracker

## Context
The app currently simulates "In Between" digitally (random deck, virtual card dealing, player balance tracking). The user wants a **physical game companion**: real cards are dealt at the table, the app just tracks which ranks appeared (for probability), records the pot, and shows decision recommendations.

Three specific issues to fix:
1. Cards should be **manually entered** (rank taps), not randomly dealt
2. After **all players complete one turn** (end of round), everyone antes again automatically
3. **No player balance tracking** — only the pot amount matters

## Implementation Order

Files must be edited in dependency order: `logic.ts` → `App.tsx` → components.

---

## 1. `src/game/logic.ts`

- **Remove**: `Suit`, `Card`, `createDeck`, `shuffleDeck`, `rankValue`
- **Remove** `balance` from `Player` interface
- **Change** `TurnPhase` to `'input' | 'betting' | 'drawing' | 'result'`
- **Rewrite** all function signatures from `Card` to `Rank`:
  - `isMandatoryPass(r1: Rank, r2: Rank)`
  - `getLowHigh(r1: Rank, r2: Rank)`
  - `determineOutcome(drawnRank: Rank, r1: Rank, r2: Rank)`
- **Rewrite** `calcProbability(r1, r2, usedRanks: Rank[])` — each rank has 4 copies; count remaining copies of in-between ranks vs total remaining (52 − usedRanks.length)
- **Update** `getDecision` to match new signature
- **Add** `rankUsedCount(rank: Rank, usedRanks: Rank[]): number`

## 2. `src/App.tsx`

**Updated state types:**
```ts
interface TurnState {
  card1Rank: Rank | null;
  card2Rank: Rank | null;
  drawnRank: Rank | null;
  betAmount: number;
  phase: TurnPhase;
  outcome: 'win' | 'loss' | 'post' | 'pass' | null;
}
interface AppState {
  screen: 'setup' | 'game' | 'newRound';
  players: Player[];   // no balance
  pot: number;
  usedRanks: Rank[];
  currentPlayerIndex: number;
  turnInRound: number;  // 0-indexed; resets when all players complete a turn
  anteAmount: number;
  turn: TurnState | null;
}
```

**Remove**: `dealTwoCards`, `checkAndRefillPot`, the 600ms dealing `useEffect`, all `deck: Card[]` and `balance` references.

**New handlers**:
- `handleSelectCard1(rank)` — sets `card1Rank`, stays in `'input'` phase
- `handleSelectCard2(rank)` — sets `card2Rank`, advances to `'betting'`
- `handleSelectDrawnCard(rank)` — computes outcome, updates pot, adds all 3 ranks to `usedRanks`, advances to `'result'`
- `handleConfirmNewRound()` — called from the `'newRound'` screen; ante up pot, reset `turnInRound`/`currentPlayerIndex`, new input turn

**Round end logic** (in `handleNextTurn` and `handlePass`):
- `turnInRound + 1 >= players.length` → `screen: 'newRound'`
- Else → advance `currentPlayerIndex`, increment `turnInRound`, fresh `'input'` turn

**`handleStart`** takes `anteAmount` (replaces startingBalance); initial pot = `players.length * anteAmount`.

**Render**:
```tsx
if screen === 'setup' → <PlayerSetup />
if screen === 'newRound' → <NewRoundOverlay />
else → <GameBoard />
```

Pass `usedRanks`, `onSelectCard1`, `onSelectCard2`, `onSelectDrawnCard` to GameBoard. Remove `deckCount`.

## 3. `src/components/PlayerSetup.tsx`

- Rename `balance` → `anteAmount`; change label "Starting Balance" → "Ante Per Round"
- Update info text: "Each player pays $[ante] per round. Starting pot: $[players × ante]"

## 4. `src/components/PlayerList.tsx`

- Remove balance `<div>` and `isNeg` logic entirely
- Just player name + current-player highlight (gold border, pulse)

## 5. `src/components/DecisionPanel.tsx`

- Remove `playerBalance` from props
- `const maxBet = pot` (was `Math.min(pot, playerBalance)`)
- Update phase guard: `if (phase === 'result' || phase === 'input') return null`

## 6. `src/components/RankPicker.tsx` (NEW)

13-button grid (A 2 3 4 5 6 7 8 9 10 J Q K), ~4 columns, tap-friendly (~56×56px each).

Props:
```ts
{ label: string; usedRanks: Rank[]; selectedRank: Rank | null; onSelect: (r: Rank) => void; }
```

Each button:
- Shows rank label (A, 2–10, J, Q, K)
- Small "x/4" used-count badge when usedCount > 0
- Disabled + dimmed when all 4 copies used
- Gold highlight when selected

Label ("Select Card 1" etc.) renders above grid in gold mono font.

## 7. `src/components/CardDisplay.tsx`

**Updated props**: `card1Rank: Rank | null`, `card2Rank: Rank | null`, `drawnRank: Rank | null`, `phase: TurnPhase`

- Remove `suitSymbol`, `isRed`, `CardBack`, suit imports
- **Simplify `PlayingCard`**: takes `rank: Rank`; shows rank label top-left, large rank center, rotated rank bottom-right; single neutral color (no red/black suit split)
- Render logic:
  - `card1` slot: show card if `card1Rank` set, else dashed placeholder
  - `card2` slot: show card if `card2Rank` set, else dashed placeholder (subtle before card1 chosen)
  - Center drawn slot: hidden in `'input'`/`'betting'`; dashed in `'drawing'`; filled in `'result'`

## 8. `src/components/GameBoard.tsx`

**Remove**: `deckCount` prop and header display; `maxBet` from player balance; balance span in current player indicator; `'dealing'` spinner button placeholder; "Draw Card" button; old `CardDisplay` Card props.

**Update**:
- `isMandatoryPass(turn.card1Rank, turn.card2Rank)` (Rank-based)
- `<CardDisplay card1Rank=... card2Rank=... drawnRank=... phase=... />`
- `<DecisionPanel>` without `playerBalance`
- Bet button disabled: `isMustPass || pot < 1`

**Add**:
- `RankPicker` during `'input'` phase: show "Select Card 1" picker if `!card1Rank`, else "Select Card 2" picker
- `RankPicker` during `'drawing'` phase: "Select Drawn Card" picker (replaces old "Draw Card" button)

## 9. `src/components/NewRoundOverlay.tsx` (NEW)

Simple full-screen screen (matching dark theme). Shows:
- "Round Complete" header
- Ante info: "Each player antes $[anteAmount]"
- New pot preview: "$[current pot + anteAmount × players]"
- Gold primary button: "Start New Round" → calls `onConfirm`

Props: `{ pot, anteAmount, playerCount, onConfirm }`

---

## Verification

1. `bun run dev` — confirm app loads without TypeScript errors
2. Setup screen: enter 3 player names + ante $2; pot shows $6 on game screen
3. Input phase: tap a rank for card 1 → picker switches to card 2; tap card 2 → betting phase shows
4. Probability shown correctly; pass pot increments by $1; bet advances to drawing
5. Drawing phase: tap drawn card rank → result shown with correct win/loss/post
6. After all 3 players complete a turn → New Round screen shows with updated pot preview
7. Confirm new round → pot increases, turns reset, player 1 goes again
8. Used rank counts shown on picker buttons decrease correctly across turns
9. `bun run build` — passes type-check and builds cleanly
