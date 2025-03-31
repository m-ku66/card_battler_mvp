"use client";
import { GameState } from "@/app/core/models/Game";
import { Player } from "@/app/core/models/Player";

interface BattleArenaProps {
  gameState: GameState;
  player: Player;
  opponent: Player;
}

export default function BattleArena({
  gameState,
  player,
  opponent,
}: BattleArenaProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Player's mage */}
      {player.selectedMageId && (
        <div className="border p-4 rounded bg-transparent text-blue-400 flex-1">
          <h3 className="font-bold">Your Mage</h3>
          <div>{gameState.mages[player.selectedMageId].name}</div>
          <div>
            HP: {gameState.mages[player.selectedMageId].health}/
            {gameState.mages[player.selectedMageId].maxHealth}
          </div>
          <div>
            MP: {gameState.mages[player.selectedMageId].magia}/
            {gameState.mages[player.selectedMageId].maxMagia}
          </div>
          <div>
            Attack: {gameState.mages[player.selectedMageId].attackPower}
          </div>
          <div>
            Resistance: {gameState.mages[player.selectedMageId].resistance}
          </div>
          <div>Agility: {gameState.mages[player.selectedMageId].agility}</div>
        </div>
      )}

      {/* Opponent's mage */}
      {opponent.selectedMageId && (
        <div className="border p-4 rounded bg-transparent text-red-400 flex-1">
          <h3 className="font-bold">Enemy Mage</h3>
          <div>{gameState.mages[opponent.selectedMageId].name}</div>
          <div>
            HP: {gameState.mages[opponent.selectedMageId].health}/
            {gameState.mages[opponent.selectedMageId].maxHealth}
          </div>
          <div>
            MP: {gameState.mages[opponent.selectedMageId].magia}/
            {gameState.mages[opponent.selectedMageId].maxMagia}
          </div>
          <div>
            Attack: {gameState.mages[opponent.selectedMageId].attackPower}
          </div>
          <div>
            Resistance: {gameState.mages[opponent.selectedMageId].resistance}
          </div>
          <div>Agility: {gameState.mages[opponent.selectedMageId].agility}</div>
        </div>
      )}
    </div>
  );
}
