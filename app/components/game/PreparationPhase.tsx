"use client";
import { useState } from "react";
import { GameState } from "@/app/core/models/Game";
import MageSelection from "./preparation/MageSelection";
import GrimoireSelection from "./preparation/GrimoireSelection";

interface PreparationPhaseProps {
  gameState: GameState;
  playerId: string;
  onSelectMage: (playerId: string, mageId: string) => void;
  onSelectGrimoire: (playerId: string, grimoireIds: string[]) => void;
  onStartBattle: () => void;
}

export default function PreparationPhase({
  gameState,
  playerId,
  onSelectMage,
  onSelectGrimoire,
  onStartBattle,
}: PreparationPhaseProps) {
  // Track the preparation step
  const [prepStep, setPrepStep] = useState<"mage" | "grimoire">("mage");

  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) return null;

  return (
    <div className="mb-6">
      {prepStep === "mage" ? (
        <MageSelection
          gameState={gameState}
          player={player}
          onSelectMage={(mageId) => onSelectMage(playerId, mageId)}
          onContinue={() => setPrepStep("grimoire")}
        />
      ) : (
        <GrimoireSelection
          gameState={gameState}
          player={player}
          onSelectGrimoire={(grimoireIds) =>
            onSelectGrimoire(playerId, grimoireIds)
          }
          onBack={() => setPrepStep("mage")}
          onStartBattle={onStartBattle}
        />
      )}
    </div>
  );
}
