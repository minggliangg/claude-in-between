export type Rank = 1|2|3|4|5|6|7|8|9|10|11|12|13;

export interface Player { id: string; name: string; }
export type TurnPhase = 'betting' | 'drawing' | 'result';

export function rankLabel(rank: Rank): string {
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return String(rank);
}

export function isMandatoryPass(r1: Rank, r2: Rank): boolean {
  if (r1 === r2) return true;
  if (Math.abs(r1 - r2) === 1) return true;
  return false;
}

export function getLowHigh(r1: Rank, r2: Rank): [number, number] {
  return r1 < r2 ? [r1, r2] : [r2, r1];
}

export function rankUsedCount(rank: Rank, usedRanks: Rank[]): number {
  return usedRanks.filter(r => r === rank).length;
}

export function calcProbability(r1: Rank, r2: Rank, usedRanks: Rank[]): number {
  const totalRemaining = 52 - usedRanks.length;
  if (totalRemaining === 0) return 0;
  const [low, high] = getLowHigh(r1, r2);
  let inBetweenCount = 0;
  for (let r = low + 1; r < high; r++) {
    const used = rankUsedCount(r as Rank, usedRanks);
    inBetweenCount += 4 - used;
  }
  return inBetweenCount / totalRemaining;
}

export interface Decision {
  action: 'MUST_PASS' | 'BET' | 'PASS';
  probability: number;
  suggestedBet: number;
  reasoning: string;
}

export function getDecision(r1: Rank, r2: Rank, usedRanks: Rank[], pot: number): Decision {
  if (isMandatoryPass(r1, r2)) {
    return {
      action: 'MUST_PASS',
      probability: 0,
      suggestedBet: 0,
      reasoning: 'Cards are the same rank or consecutive — mandatory pass.',
    };
  }
  const [low, high] = getLowHigh(r1, r2);
  const totalRemaining = 52 - usedRanks.length;
  let inBetweenCount = 0;
  for (let r = low + 1; r < high; r++) {
    const used = rankUsedCount(r as Rank, usedRanks);
    inBetweenCount += 4 - used;
  }
  const probability = totalRemaining > 0 ? inBetweenCount / totalRemaining : 0;
  const action = probability >= 0.5 ? 'BET' : 'PASS';
  const suggestedBet = action === 'BET' ? Math.min(pot, Math.round(pot * probability)) : 0;
  const lowLabel = rankLabel(low as Rank);
  const highLabel = rankLabel(high as Rank);
  const reasoning = `${inBetweenCount} of ${totalRemaining} remaining cards fall between ${lowLabel} and ${highLabel}`;
  return { action, probability, suggestedBet, reasoning };
}

export function determineOutcome(drawnRank: Rank, r1: Rank, r2: Rank): 'win' | 'loss' | 'post' {
  const [low, high] = getLowHigh(r1, r2);
  if (drawnRank > low && drawnRank < high) return 'win';
  if (drawnRank === low || drawnRank === high) return 'post';
  return 'loss';
}

export function calcPotDelta(outcome: 'win' | 'loss' | 'post' | 'pass', bet: number): number {
  switch (outcome) {
    case 'win': return -bet;
    case 'loss': return bet;
    case 'post': return 2 * bet;
    case 'pass': return 1;
  }
}
