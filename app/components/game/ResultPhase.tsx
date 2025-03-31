// components/game/ResultPhase.tsx
"use client";
import { GameState } from "@/app/core/models/Game";

interface ResultPhaseProps {
  gameState: GameState;
  playerId: string;
  onPlayAgain: () => void;
}

export default function ResultPhase({
  gameState,
  playerId,
  onPlayAgain,
}: ResultPhaseProps) {
  return (
    <div className="mt-8 text-center">
      <h2 className="text-3xl font-bold mb-4">
        {gameState.winner === playerId ? "Victory!" : "Defeat!"}
      </h2>
      <p className="mb-4">
        {gameState.winner === playerId
          ? "Your opponent's mage has been defeated!"
          : "Your mage has been defeated!"}
      </p>
      <button
        onClick={onPlayAgain}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg"
      >
        Play Again
      </button>
    </div>
  );
}
