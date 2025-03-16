"use client";

import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { useGameEvent } from "./hooks/useGameEvents";
import { GameEventType } from "./core/events/Events";

export default function GamePage() {
  const {
    gameState,
    initializeGame,
    selectMage,
    selectGrimoire,
    startBattle,
    endTurn,
  } = useGameStore();

  // Initialize the game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Listen for spell cast events
  useGameEvent(GameEventType.SPELL_CAST, (data) => {
    console.log(
      `Spell cast: ${data.spellId} from ${data.casterId} to ${data.targetId}`
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Sorcery Card Game</h1>

      <div className="mb-4">
        <div className="font-semibold">Current Phase: {gameState.phase}</div>
        {gameState.phase === "battle" && (
          <div>Battle Phase: {gameState.battlePhase}</div>
        )}
        <div>Current Turn: {gameState.currentTurn}</div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => startBattle()}
          className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Battle
        </button>

        <button
          onClick={() => endTurn()}
          className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded"
          disabled={gameState.phase !== "battle"}
        >
          End Turn
        </button>
      </div>

      <pre className="mt-8 p-4 bg-gray-100/[0.2] rounded overflow-auto">
        {JSON.stringify(gameState, null, 2)}
      </pre>
    </div>
  );
}
