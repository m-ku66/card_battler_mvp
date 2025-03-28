"use client";
import { useEffect, useState } from "react";
import { useGameStore } from "./store/gameStore";
import { useGameEvent } from "./hooks/useGameEvents";
import { GameEventType } from "./core/events/Events";
import MageSelectionCard from "./components/game/MageSelectionCard";
import GrimoireSelectionCard from "./components/game/GrimoireSelectionCard";

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

  // Track the preparation step
  const [prepStep, setPrepStep] = useState<"mage" | "grimoire">("mage");

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

  // Get the first player for now (we'll handle multiple players later)
  const currentPlayer = gameState.players[0] || {
    id: "",
    selectedMageId: null,
    studentRoster: [],
    selectedGrimoireIds: [],
  };

  // Get mages in player's roster
  const playerMages = currentPlayer.studentRoster
    .map((id) => gameState.mages[id])
    .filter(Boolean);

  // Get selected mage
  const selectedMage = currentPlayer.selectedMageId
    ? gameState.mages[currentPlayer.selectedMageId]
    : null;

  // Get grimoires for the selected mage
  const availableGrimoires = selectedMage
    ? selectedMage.grimoireIds
        .map((id) => gameState.grimoires[id])
        .filter(Boolean)
    : [];

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

  const handleGrimoireSelect = (grimoireId: string) => {
    // For simplicity, we'll just select one grimoire
    selectGrimoire(currentPlayer.id, [grimoireId]);
  };

  const handleContinueToGrimoire = () => {
    setPrepStep("grimoire");
  };

  const handleStartBattle = () => {
    startBattle();
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
          {/* Mage Selection Step */}
          {prepStep === "mage" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Select Your Mage</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                onClick={handleContinueToGrimoire}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!currentPlayer.selectedMageId}
              >
                Continue to Grimoire Selection
              </button>
            </>
          )}

          {/* Grimoire Selection Step */}
          {prepStep === "grimoire" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select a Grimoire</h2>
                <button
                  onClick={() => setPrepStep("mage")}
                  className="text-blue-500 hover:underline"
                >
                  ← Back to Mage Selection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableGrimoires.map((grimoire) => (
                  <GrimoireSelectionCard
                    key={grimoire.id}
                    grimoire={grimoire}
                    spells={gameState.spells}
                    isSelected={currentPlayer.selectedGrimoireIds.includes(
                      grimoire.id
                    )}
                    onSelect={handleGrimoireSelect}
                  />
                ))}
              </div>

              <button
                onClick={handleStartBattle}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPlayer.selectedGrimoireIds.length === 0}
              >
                Start Battle
              </button>
            </>
          )}
        </div>
      )}

      {/* Battle Phase UI */}
      {gameState.phase === "battle" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Player's mage */}
            {currentPlayer.selectedMageId && (
              <div className="border p-4 rounded bg-transparent text-blue-400 flex-1">
                <h3 className="font-bold">Your Mage</h3>
                <div>{gameState.mages[currentPlayer.selectedMageId].name}</div>
                <div>
                  HP: {gameState.mages[currentPlayer.selectedMageId].health}/
                  {gameState.mages[currentPlayer.selectedMageId].maxHealth}
                </div>
                <div>
                  MP: {gameState.mages[currentPlayer.selectedMageId].magia}/
                  {gameState.mages[currentPlayer.selectedMageId].maxMagia}
                </div>
                <div>
                  Attack:{" "}
                  {gameState.mages[currentPlayer.selectedMageId].attackPower}
                </div>
                <div>
                  Resistance:{" "}
                  {gameState.mages[currentPlayer.selectedMageId].resistance}
                </div>
                <div>
                  Agility:{" "}
                  {gameState.mages[currentPlayer.selectedMageId].agility}
                </div>
              </div>
            )}

            {/* AI's mage */}
            {gameState.players[1]?.selectedMageId && (
              <div className="border p-4 rounded bg-transparent text-red-400 flex-1">
                <h3 className="font-bold">Enemy Mage</h3>
                <div>
                  {gameState.mages[gameState.players[1].selectedMageId].name}
                </div>
                <div>
                  HP:{" "}
                  {gameState.mages[gameState.players[1].selectedMageId].health}/
                  {
                    gameState.mages[gameState.players[1].selectedMageId]
                      .maxHealth
                  }
                </div>
                <div>
                  MP:{" "}
                  {gameState.mages[gameState.players[1].selectedMageId].magia}/
                  {
                    gameState.mages[gameState.players[1].selectedMageId]
                      .maxMagia
                  }
                </div>
                <div>
                  Attack:{" "}
                  {
                    gameState.mages[gameState.players[1].selectedMageId]
                      .attackPower
                  }
                </div>
                <div>
                  Resistance:{" "}
                  {
                    gameState.mages[gameState.players[1].selectedMageId]
                      .resistance
                  }
                </div>
                <div>
                  Agility:{" "}
                  {gameState.mages[gameState.players[1].selectedMageId].agility}
                </div>
              </div>
            )}
          </div>

          {/* Spell selection section */}
          {gameState.battlePhase === "spellSelection" && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Select a Spell</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {currentPlayer.selectedGrimoireIds.map((grimoireId) => {
                  const grimoire = gameState.grimoires[grimoireId];
                  if (!grimoire) return null;

                  return grimoire.spellIds.map((spellId) => {
                    const spell = gameState.spells[spellId];
                    if (!spell) return null;

                    return (
                      <div
                        key={spell.id}
                        className={`border p-3 rounded cursor-pointer 
                ${
                  currentPlayer.selectedSpellId === spell.id
                    ? "bg-blue-100 border-blue-500"
                    : "hover:bg-blue-50"
                }`}
                        onClick={() => selectSpell(currentPlayer.id, spell.id)}
                      >
                        <h3 className="font-semibold">{spell.name}</h3>
                        <p className="text-sm">{spell.description}</p>
                        <div className="text-sm mt-1">
                          <span className="mr-2">Cost: {spell.magiaCost}</span>
                          <span>Power: {spell.basePower}</span>
                        </div>
                      </div>
                    );
                  });
                })}

                {/* Also show innate spell */}
                {currentPlayer.selectedMageId &&
                  gameState.mages[currentPlayer.selectedMageId] && (
                    <div
                      className={`border p-3 rounded cursor-pointer border-purple-300
            ${
              currentPlayer.selectedSpellId ===
              gameState.mages[currentPlayer.selectedMageId]?.innateSpellId
                ? "bg-purple-100 border-purple-500"
                : "hover:bg-purple-50"
            }`}
                      onClick={() => {
                        const mage =
                          gameState.mages[currentPlayer.selectedMageId!];
                        selectSpell(currentPlayer.id, mage.innateSpellId);
                      }}
                    >
                      <h3 className="font-semibold">
                        {(gameState.mages[currentPlayer.selectedMageId]
                          ?.innateSpellId &&
                          gameState.spells[
                            gameState.mages[currentPlayer.selectedMageId]
                              ?.innateSpellId
                          ]?.name) ||
                          "Innate Spell"}
                      </h3>
                      <p className="text-sm">Your mage's innate ability</p>
                      <div className="text-xs mt-1 text-purple-500">
                        50% reduced cost
                      </div>
                    </div>
                  )}
              </div>

              <div className="bg-gray-50 p-3 rounded mb-4">
                <h3 className="font-semibold mb-2">Selected Spell:</h3>
                <div className="border rounded p-2 min-h-20 bg-white">
                  {currentPlayer.selectedSpellId ? (
                    <>
                      <div className="font-medium">
                        {gameState.spells[currentPlayer.selectedSpellId]?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {
                          gameState.spells[currentPlayer.selectedSpellId]
                            ?.description
                        }
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-center h-full flex items-center justify-center">
                      Select a spell
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => endTurn()}
                className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!currentPlayer.selectedSpellId}
              >
                Confirm Spell
              </button>
            </div>
          )}

          {/* Battle Phase UI - Execution Phase */}
          {gameState.phase === "battle" &&
            gameState.battlePhase === "execution" && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">
                  Spells Executing...
                </h2>
                <div className="p-4 bg-gray-50 rounded">
                  <p>Watch as the spells take effect!</p>
                  {/* We could add animations or visual effects here */}
                </div>
              </div>
            )}

          {/* Result Phase UI */}
          {/* @ts-ignore */}
          {gameState.phase === "result" && (
            <div className="mt-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {gameState.winner === currentPlayer.id ? "Victory!" : "Defeat!"}
              </h2>
              <p className="mb-4">
                {gameState.winner === currentPlayer.id
                  ? "Your opponent's mage has been defeated!"
                  : "Your mage has been defeated!"}
              </p>
              <button
                onClick={() => initializeGame()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Execution phase UI - show something different when spells are being executed */}
          {gameState.battlePhase === "execution" && (
            <div>
              <button
                onClick={() => endTurn()}
                className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      <pre className="mt-8 p-4 bg-gray-100/[0.2] rounded overflow-auto text-xs">
        {JSON.stringify(gameState, null, 2)}
      </pre>
    </div>
  );
}
