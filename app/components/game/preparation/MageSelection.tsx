"use client";
import { Player } from "@/app/core/models/Player";
import { GameState } from "@/app/core/models/Game";
import MageSelectionCard from "../MageSelectionCard";

interface MageSelectionProps {
  gameState: GameState;
  player: Player;
  onSelectMage: (mageId: string) => void;
  onContinue: () => void;
}

export default function MageSelection({
  gameState,
  player,
  onSelectMage,
  onContinue,
}: MageSelectionProps) {
  // Get mages in player's roster
  const playerMages = player.studentRoster
    .map((id) => gameState.mages[id])
    .filter(Boolean);

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Select Your Mage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playerMages.map((mage) => (
          <MageSelectionCard
            key={mage.id}
            mage={mage}
            isSelected={player.selectedMageId === mage.id}
            onSelect={onSelectMage}
          />
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!player.selectedMageId}
      >
        Continue to Grimoire Selection
      </button>
    </>
  );
}
