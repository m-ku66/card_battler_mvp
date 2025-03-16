"use client";
import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { useGameEvent } from "./hooks/useGameEvents";
import { GameEventType } from "./core/events/Events";
import MageSelectionCard from "./components/game/MageSelectionCard";

export default function GamePage() {
  const {
    gameState,
    initializeGame,
    selectMage,
    selectGrimoire,
    startBattle,
    endTurn,
  } = useGameStore();

  // Get the first player for now (we'll handle multiple players later)
  const currentPlayer = gameState.players[0] || {
    id: "",
    selectedMageId: null,
    studentRoster: [],
  };

  // Get mages in player's roster
  const playerMages = currentPlayer.studentRoster
    .map((id) => gameState.mages[id])
    .filter(Boolean);

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

  const handleMageSelect = (mageId: string) => {
    selectMage(currentPlayer.id, mageId);
  };

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

      {/* Preparation Phase UI */}
      {gameState.phase === "preparation" && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Your Mage</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {playerMages.map((mage) => (
              <MageSelectionCard
                key={mage.id}
                mage={mage}
                isSelected={currentPlayer.selectedMageId === mage.id}
                onSelect={handleMageSelect}
              />
            ))}
          </div>

          <button
            onClick={() => startBattle()}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentPlayer.selectedMageId}
          >
            Start Battle
          </button>
        </div>
      )}

      {/* Battle Phase UI */}
      {gameState.phase === "battle" && (
        <div className="space-y-4">
          <button
            onClick={() => endTurn()}
            className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
          >
            End Turn
          </button>
        </div>
      )}

      <pre className="mt-8 p-4 bg-gray-100/[0.2] rounded overflow-auto">
        {JSON.stringify(gameState, null, 2)}
      </pre>
    </div>
  );
}
