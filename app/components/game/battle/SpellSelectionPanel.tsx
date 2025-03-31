"use client";
import { GameState } from "@/app/core/models/Game";
import { Player } from "@/app/core/models/Player";

interface SpellSelectionPanelProps {
  gameState: GameState;
  player: Player;
  onSelectSpell: (spellId: string) => void;
  onConfirmSpell: () => void;
}

export default function SpellSelectionPanel({
  gameState,
  player,
  onSelectSpell,
  onConfirmSpell,
}: SpellSelectionPanelProps) {
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

            return (
              <div
                key={spell.id}
                className={`border p-3 rounded cursor-pointer 
                  ${
                    player.selectedSpellId === spell.id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-blue-50"
                  }`}
                onClick={() => onSelectSpell(spell.id)}
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
        {player.selectedMageId && gameState.mages[player.selectedMageId] && (
          <div
            className={`border p-3 rounded cursor-pointer border-purple-300
              ${
                player.selectedSpellId ===
                gameState.mages[player.selectedMageId]?.innateSpellId
                  ? "bg-purple-100 border-purple-500"
                  : "hover:bg-purple-50"
              }`}
            onClick={() => {
              const mage = gameState.mages[player.selectedMageId!];
              onSelectSpell(mage.innateSpellId);
            }}
          >
            <h3 className="font-semibold">
              {(gameState.mages[player.selectedMageId]?.innateSpellId &&
                gameState.spells[
                  gameState.mages[player.selectedMageId]?.innateSpellId
                ]?.name) ||
                "Innate Spell"}
            </h3>
            <p className="text-sm">Your mage's innate ability</p>
            <div className="text-xs mt-1 text-purple-500">50% reduced cost</div>
          </div>
        )}
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
