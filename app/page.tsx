// app/page.tsx
"use client";
import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { useGameEvent } from "./hooks/useGameEvents";
import { GameEventType } from "./core/events/Events";
import GameHeader from "./components/game/GameHeader";
import PreparationPhase from "./components/game/PreparationPhase";
import BattlePhase from "./components/game/BattlePhase";
import ResultPhase from "./components/game/ResultPhase";

export default function GamePage() {
  const {
    gameState,
    initializeGame,
    selectMage,
    selectGrimoire,
    selectSpell,
    startBattle,
    endTurn,
  } = useGameStore();

  // Add this effect for automatic progression
  useEffect(() => {
    // Only run this effect in execution phase
    if (gameState.phase === "battle" && gameState.battlePhase === "execution") {
      // Set a timer to automatically progress to the next turn
      const timer = setTimeout(() => {
        console.log("Auto-advancing from execution phase");
        endTurn();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.battlePhase, endTurn]);

  // Get the player ID (we'll use the first player for now)
  const playerId = gameState.players[0]?.id || "";

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

      <GameHeader gameState={gameState} />

      {/* Render the appropriate phase component */}
      {gameState.phase === "preparation" && (
        <PreparationPhase
          gameState={gameState}
          playerId={playerId}
          onSelectMage={selectMage}
          onSelectGrimoire={selectGrimoire}
          onStartBattle={startBattle}
        />
      )}

      {gameState.phase === "battle" && (
        <BattlePhase
          gameState={gameState}
          playerId={playerId}
          onSelectSpell={selectSpell}
          onEndTurn={endTurn}
        />
      )}

      {gameState.phase === "result" && (
        <ResultPhase
          gameState={gameState}
          playerId={playerId}
          onPlayAgain={initializeGame}
        />
      )}

      {/* Debug state display */}
      {/* <pre className="mt-8 p-4 bg-gray-100/[0.2] rounded overflow-auto text-xs">
        {JSON.stringify(gameState, null, 2)}
      </pre> */}
    </div>
  );
}
