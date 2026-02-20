import { useState } from 'react';
import './App.css';
import type { Rank, Player, TurnPhase } from './game/logic';
import { determineOutcome, calcPotDelta, getDecision } from './game/logic';
import PlayerSetup from './components/PlayerSetup';
import GameBoard from './components/GameBoard';
import NewRoundOverlay from './components/NewRoundOverlay';
import DealingPhase from './components/DealingPhase';

export interface DealingStep {
  playerIndex: number;
  card1: Rank | null;
}

export interface TurnState {
  card1Rank: Rank | null;
  card2Rank: Rank | null;
  drawnRank: Rank | null;
  betAmount: number;
  phase: TurnPhase;
  outcome: 'win' | 'loss' | 'post' | 'pass' | null;
}

export interface AppState {
  screen: 'setup' | 'dealing' | 'game' | 'newRound';
  players: Player[];
  pot: number;
  usedRanks: Rank[];
  currentPlayerIndex: number;
  turnInRound: number;
  anteAmount: number;
  turn: TurnState | null;
  dealtHands: ([Rank, Rank] | null)[];
  dealingStep: DealingStep;
}

function createFreshTurn(card1: Rank, card2: Rank): TurnState {
  return {
    card1Rank: card1,
    card2Rank: card2,
    drawnRank: null,
    betAmount: 1,
    phase: 'betting',
    outcome: null,
  };
}

const initialState: AppState = {
  screen: 'setup',
  players: [],
  pot: 0,
  usedRanks: [],
  currentPlayerIndex: 0,
  turnInRound: 0,
  anteAmount: 1,
  turn: null,
  dealtHands: [],
  dealingStep: { playerIndex: 0, card1: null },
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);

  function handleStart(playerNames: string[], anteAmount: number) {
    const players: Player[] = playerNames.map((name, i) => ({
      id: String(i),
      name,
    }));
    const pot = players.length * anteAmount;
    setState({
      screen: 'dealing',
      players,
      pot,
      usedRanks: [],
      currentPlayerIndex: 0,
      turnInRound: 0,
      anteAmount,
      turn: null,
      dealtHands: players.map(() => null),
      dealingStep: { playerIndex: 0, card1: null },
    });
  }

  function handleDealCard1(rank: Rank) {
    setState(s => ({
      ...s,
      usedRanks: [...s.usedRanks, rank],
      dealingStep: { ...s.dealingStep, card1: rank },
    }));
  }

  function handleDealCard2(rank: Rank) {
    setState(s => {
      const card1 = s.dealingStep.card1;
      if (!card1) return s;
      const newDealtHands = [...s.dealtHands];
      newDealtHands[s.dealingStep.playerIndex] = [card1, rank];
      const newUsedRanks = [...s.usedRanks, rank];
      const isLastPlayer = s.dealingStep.playerIndex >= s.players.length - 1;
      if (isLastPlayer) {
        const firstHand = newDealtHands[0]!;
        return {
          ...s,
          usedRanks: newUsedRanks,
          dealtHands: newDealtHands,
          dealingStep: { playerIndex: 0, card1: null },
          screen: 'game',
          turn: createFreshTurn(firstHand[0], firstHand[1]),
        };
      }
      return {
        ...s,
        usedRanks: newUsedRanks,
        dealtHands: newDealtHands,
        dealingStep: { playerIndex: s.dealingStep.playerIndex + 1, card1: null },
      };
    });
  }

  function handleSelectDrawnCard(rank: Rank) {
    setState(s => {
      if (!s.turn || !s.turn.card1Rank || !s.turn.card2Rank) return s;
      const outcome = determineOutcome(rank, s.turn.card1Rank, s.turn.card2Rank);
      const delta = calcPotDelta(outcome, s.turn.betAmount);
      const newPot = s.pot + delta;
      const newUsedRanks = [...s.usedRanks, rank];
      return {
        ...s,
        pot: newPot,
        usedRanks: newUsedRanks,
        turn: { ...s.turn, drawnRank: rank, outcome, phase: 'result' },
      };
    });
  }

  function handlePass() {
    setState(s => {
      const newPot = s.pot + 1;
      const nextTurnInRound = s.turnInRound + 1;
      if (nextTurnInRound >= s.players.length) {
        return {
          ...s,
          pot: newPot,
          turnInRound: 0,
          screen: 'newRound',
          turn: null,
        };
      }
      const nextIndex = (s.currentPlayerIndex + 1) % s.players.length;
      const nextHand = s.dealtHands[nextIndex];
      if (!nextHand) return s;
      return {
        ...s,
        pot: newPot,
        currentPlayerIndex: nextIndex,
        turnInRound: nextTurnInRound,
        turn: createFreshTurn(nextHand[0], nextHand[1]),
      };
    });
  }

  function handleBet(amount: number) {
    setState(s => s.turn
      ? { ...s, turn: { ...s.turn, betAmount: amount, phase: 'drawing' } }
      : s
    );
  }

  function handleBetChange(amount: number) {
    setState(s => s.turn
      ? { ...s, turn: { ...s.turn, betAmount: amount } }
      : s
    );
  }

  function handleNextTurn() {
    setState(s => {
      const nextTurnInRound = s.turnInRound + 1;
      if (nextTurnInRound >= s.players.length) {
        return {
          ...s,
          turnInRound: 0,
          screen: 'newRound',
          turn: null,
        };
      }
      const nextIndex = (s.currentPlayerIndex + 1) % s.players.length;
      const nextHand = s.dealtHands[nextIndex];
      if (!nextHand) return s;
      return {
        ...s,
        currentPlayerIndex: nextIndex,
        turnInRound: nextTurnInRound,
        turn: createFreshTurn(nextHand[0], nextHand[1]),
      };
    });
  }

  function handleConfirmNewRound() {
    setState(s => {
      const newPot = s.pot + s.players.length * s.anteAmount;
      return {
        ...s,
        pot: newPot,
        usedRanks: [],
        currentPlayerIndex: 0,
        turnInRound: 0,
        screen: 'dealing',
        turn: null,
        dealtHands: s.players.map(() => null),
        dealingStep: { playerIndex: 0, card1: null },
      };
    });
  }

  function handleExitToSetup() {
    setState(initialState);
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const decision = state.turn && state.turn.card1Rank && state.turn.card2Rank && state.turn.phase === 'betting'
    ? getDecision(state.turn.card1Rank, state.turn.card2Rank, state.usedRanks, state.pot)
    : null;

  if (state.screen === 'setup') {
    return <PlayerSetup onStart={handleStart} />;
  }

  if (state.screen === 'dealing') {
    return (
      <DealingPhase
        players={state.players}
        dealingStep={state.dealingStep}
        usedRanks={state.usedRanks}
        onDealCard1={handleDealCard1}
        onDealCard2={handleDealCard2}
        onExitToSetup={handleExitToSetup}
      />
    );
  }

  if (state.screen === 'newRound') {
    return (
      <NewRoundOverlay
        pot={state.pot}
        anteAmount={state.anteAmount}
        playerCount={state.players.length}
        onConfirm={handleConfirmNewRound}
      />
    );
  }

  return (
    <GameBoard
      players={state.players}
      pot={state.pot}
      currentPlayerIndex={state.currentPlayerIndex}
      currentPlayer={currentPlayer}
      turn={state.turn}
      decision={decision}
      usedRanks={state.usedRanks}
      onSelectDrawnCard={handleSelectDrawnCard}
      onPass={handlePass}
      onBet={handleBet}
      onNextTurn={handleNextTurn}
      onBetChange={handleBetChange}
      onExitToSetup={handleExitToSetup}
    />
  );
}
