"use client";
import { GameState } from "@/app/core/models/Game";

interface GameHeaderProps {
  gameState: GameState;
}

export default function GameHeader({ gameState }: GameHeaderProps) {
  return (
    <div className="mb-4">
      <div className="font-semibold">Current Phase: {gameState.phase}</div>
      {gameState.phase === "battle" && (
        <div>Battle Phase: {gameState.battlePhase}</div>
      )}
      <div>Current Turn: {gameState.currentTurn}</div>
    </div>
  );
}
