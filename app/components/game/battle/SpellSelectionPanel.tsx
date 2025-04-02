"use client";
import { GameState } from "@/app/core/models/Game";
import { Player } from "@/app/core/models/Player";

interface SpellSelectionPanelProps {
  gameState: GameState;
  player: Player;
  onSelectSpell: (spellId: string, isInnate?: boolean) => void;
  onConfirmSpell: () => void;
}

export default function SpellSelectionPanel({
  gameState,
  player,
  onSelectSpell,
  onConfirmSpell,
}: SpellSelectionPanelProps) {
  // Get the selected mage's current magia
  const selectedMage = player.selectedMageId
    ? gameState.mages[player.selectedMageId]
    : null;

  const currentMagia = selectedMage?.magia || 0;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Select a Spell</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {player.selectedGrimoireIds.map((grimoireId) => {
          const grimoire = gameState.grimoires[grimoireId];
          if (!grimoire) return null;

          return grimoire.spellIds.map((spellId) => {
            const spell = gameState.spells[spellId];
            if (!spell) return null;

            // Check if player has enough magia to cast this spell
            const hasEnoughMagia = currentMagia >= spell.magiaCost;

            return (
              <div
                key={spell.id}
                className={`border p-3 rounded 
                  ${
                    player.selectedSpellId === spell.id &&
                    !player.isSelectedSpellInnate
                      ? "bg-blue-100 border-blue-500"
                      : hasEnoughMagia
                      ? "hover:bg-blue-50 cursor-pointer"
                      : "opacity-50 cursor-not-allowed bg-gray-100"
                  }`}
                onClick={() => {
                  // Only allow selection if player has enough magia
                  if (!hasEnoughMagia) return;

                  // If already selected, deselect it
                  if (
                    player.selectedSpellId === spell.id &&
                    !player.isSelectedSpellInnate
                  ) {
                    onSelectSpell("", false); // Empty string to clear selection
                  } else {
                    onSelectSpell(spell.id, false);
                  }
                }}
              >
                <h3 className="font-semibold">{spell.name}</h3>
                <p className="text-sm">{spell.description}</p>
                <div className="text-sm mt-1">
                  <span
                    className={`mr-2 ${
                      !hasEnoughMagia ? "text-red-500 font-bold" : ""
                    }`}
                  >
                    Cost: {spell.magiaCost}
                  </span>
                  <span>Power: {spell.basePower}</span>
                </div>
                {!hasEnoughMagia && (
                  <div className="text-xs text-red-500 mt-1">
                    Not enough magia!
                  </div>
                )}
              </div>
            );
          });
        })}

        {/* For the innate spell, let's apply the 50% cost reduction */}
        {player.selectedMageId &&
          gameState.mages[player.selectedMageId] &&
          (() => {
            const mage = gameState.mages[player.selectedMageId!];
            const innateSpellId = mage.innateSpellId;
            const innateSpell = gameState.spells[innateSpellId];

            if (!innateSpell) return null;

            // Apply 50% reduction for innate spell cost check
            const reducedCost = Math.floor(innateSpell.magiaCost * 0.5);
            const hasEnoughMagia = currentMagia >= reducedCost;

            return (
              <div
                className={`border p-3 rounded cursor-pointer border-purple-300
                  ${
                    player.selectedSpellId === innateSpellId &&
                    player.isSelectedSpellInnate
                      ? "bg-purple-100 border-purple-500"
                      : hasEnoughMagia
                      ? "hover:bg-purple-50"
                      : "opacity-50 cursor-not-allowed bg-gray-100"
                  }`}
                onClick={() => {
                  // Only allow selection if player has enough magia
                  if (!hasEnoughMagia) return;

                  // If already selected, deselect it
                  if (
                    player.selectedSpellId === innateSpellId &&
                    player.isSelectedSpellInnate
                  ) {
                    onSelectSpell("", false);
                  } else {
                    onSelectSpell(innateSpellId, true); // Explicitly say it's innate
                  }
                }}
              >
                <h3 className="font-semibold">{innateSpell.name}</h3>
                <p className="text-sm">Your mage's innate ability</p>
                <div className="text-xs mt-1">
                  <span
                    className={`mr-2 ${
                      !hasEnoughMagia
                        ? "text-red-500 font-bold"
                        : "text-purple-500"
                    }`}
                  >
                    Cost: {reducedCost} (50% reduced)
                  </span>
                </div>
                {!hasEnoughMagia && (
                  <div className="text-xs text-red-500 mt-1">
                    Not enough magia!
                  </div>
                )}
              </div>
            );
          })()}
      </div>

      <div className="bg-gray-50 p-3 rounded mb-4">
        <h3 className="font-semibold mb-2">Selected Spell:</h3>
        <div className="border rounded p-2 min-h-20 bg-white">
          {player.selectedSpellId ? (
            <>
              <div className="font-medium">
                {gameState.spells[player.selectedSpellId]?.name}
              </div>
              <div className="text-xs text-gray-500">
                {gameState.spells[player.selectedSpellId]?.description}
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
        onClick={onConfirmSpell}
        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!player.selectedSpellId}
      >
        Confirm Spell
      </button>
    </div>
  );
}
