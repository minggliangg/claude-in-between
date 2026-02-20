# Code Review Plan

## Scope
Address issues found in the current uncommitted changes without feature expansion.

## Findings to Address

1. **Render-time state updates in `GameBoard`** (`src/components/GameBoard.tsx:88-93`)
- Problem: `setShowOverlay` and `setTimeout` are invoked during render.
- Risk: side effects during render, duplicate triggers in Strict Mode, potential render loops.

2. **Unmanaged timeout lifecycle in `GameBoard`** (`src/components/GameBoard.tsx:92`)
- Problem: timeout is not cleared on unmount or when outcome changes quickly.
- Risk: stale timers and state updates after unmount.

3. **Weak phase typing in `DecisionPanel`** (`src/components/DecisionPanel.tsx:8`)
- Problem: `phase` typed as `string` instead of `TurnPhase`.
- Risk: invalid phase values can slip through and bypass type safety.

4. **Partial app reset on exit** (`src/App.tsx:214-216`)
- Problem: `handleExitToSetup` only resets a subset of state fields.
- Risk: stale values (`players`, `pot`, indices, ante) lingering in state can cause future regressions.

## Remediation Plan

### 1. Move overlay side effects into `useEffect`
- In `src/components/GameBoard.tsx`, replace render-time outcome check with `useEffect` that depends on `phase` and `outcome`.
- Effect behavior:
  - If `phase === 'result'` and outcome is `win|loss|post`, set overlay visible.
  - Start timeout to hide overlay after 1200ms.
  - Cleanup clears timeout.
- Keep previous-outcome gating if needed, but implemented via refs inside effect (not render branch).

### 2. Add timeout ref and cleanup
- In `src/components/GameBoard.tsx`:
  - Add `const overlayTimerRef = useRef<number | null>(null)`.
  - Before creating a new timeout, clear any existing one.
  - In effect cleanup and unmount, clear timeout and null out the ref.

### 3. Tighten `phase` type
- In `src/components/DecisionPanel.tsx`:
  - Import `TurnPhase` from `src/game/logic`.
  - Change prop type from `phase: string` to `phase: TurnPhase`.
- Ensure callers already pass a valid `TurnPhase` value.

### 4. Centralize and use `initialState`
- In `src/App.tsx`:
  - Extract current initial state object into `const initialState: AppState`.
  - Initialize React state with `useState<AppState>(initialState)`.
  - Update `handleExitToSetup` to reset with `setState(initialState)` (or a safe clone/factory if mutation risk is introduced later).
- Confirm start flow still constructs fresh runtime state in `handleStart`.

## Verification Plan

1. **Type and lint checks**
- `bun run lint`
- `bun run build`

2. **Behavior checks (manual)**
- Play one turn to result screen and confirm overlay appears once per result.
- Rapidly advance turns/results and verify no flicker/duplicate overlay behavior.
- Exit to setup, start a new game, verify pot/player/turn state is fresh and not leaked.

3. **Regression checks**
- Confirm pass/bet/draw flow is unchanged.
- Confirm round transition to `newRound` and back to `dealing` still works.

## Acceptance Criteria
- No state updates occur in render paths.
- Overlay timer is always cleaned up on rerender/unmount.
- `DecisionPanel` phase prop is compile-time constrained to `TurnPhase`.
- Exit-to-setup returns app to a clean baseline state.
- `bun run lint` and `bun run build` pass.
