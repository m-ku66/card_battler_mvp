"use client";
import { GameState } from "@/app/core/models/Game";
import BattleArena from "./battle/BattleArena";
import SpellSelectionPanel from "./battle/SpellSelectionPanel";
import ExecutionPanel from "./battle/ExecutionPanel";

interface BattlePhaseProps {
  gameState: GameState;
  playerId: string;
  onSelectSpell: (playerId: string, spellId: string) => void;
  onEndTurn: () => void;
}

export default function BattlePhase({
  gameState,
  playerId,
  onSelectSpell,
  onEndTurn,
}: BattlePhaseProps) {
  const player = gameState.players.find((p) => p.id === playerId);
  const opponent = gameState.players.find((p) => p.id !== playerId);

  if (!player || !opponent) return null;

  return (
    <div className="space-y-4">
      <BattleArena gameState={gameState} player={player} opponent={opponent} />

      {gameState.battlePhase === "spellSelection" ? (
        <SpellSelectionPanel
          gameState={gameState}
          player={player}
          onSelectSpell={(spellId) => onSelectSpell(player.id, spellId)}
          onConfirmSpell={onEndTurn}
        />
      ) : (
        <ExecutionPanel />
      )}
    </div>
  );
}
