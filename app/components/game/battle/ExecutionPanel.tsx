// "use client";

// export default function ExecutionPanel() {
//   return (
//     <div className="mt-4">
//       <h2 className="text-xl font-semibold mb-2">Spells Executing...</h2>
//       <div className="p-4 bg-gray-50 rounded">
//         <p>Watch as the spells take effect!</p>
//         {/* We could add animations or visual effects here */}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useGameEvent } from "@/app/hooks/useGameEvents";
import { GameEventType } from "@/app/core/events/Events";
import { useGameStore } from "@/app/store/gameStore";

// This will store and format battle events for display
type BattleLogEntry = {
  id: string;
  message: string;
  type:
    | "damage"
    | "heal"
    | "status"
    | "spell"
    | "defeat"
    | "critical"
    | "affinity";
  timestamp: number;
};

export default function ExecutionPanel() {
  // Get access to game state
  const { gameState } = useGameStore();

  // Store the battle events as they come in
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);

  // Helper to get mage name from ID
  const getMageName = (mageId: string) => {
    return gameState.mages[mageId]?.name || mageId;
  };

  // Helper to get spell name from ID
  const getSpellName = (spellId: string) => {
    return gameState.spells[spellId]?.name || spellId;
  };

  // Listen for spell cast events
  useGameEvent(GameEventType.SPELL_CAST, (data) => {
    setBattleLog((prev) => [
      ...prev,
      {
        id: `spell-${Date.now()}`,
        message: `${getMageName(data.casterId)} cast ${getSpellName(
          data.spellId
        )}!`,
        type: "spell",
        timestamp: Date.now(),
      },
    ]);
  });

  // Listen for damage events
  useGameEvent(GameEventType.DAMAGE_DEALT, (data) => {
    setBattleLog((prev) => [
      ...prev,
      {
        id: `damage-${Date.now()}`,
        message: `${getMageName(data.sourceId)} dealt ${
          data.amount
        } damage to ${getMageName(data.targetId)}!`,
        type: "damage",
        timestamp: Date.now(),
      },
    ]);
  });

  // Listen for healing events
  useGameEvent(GameEventType.HEALING_RECEIVED, (data) => {
    setBattleLog((prev) => [
      ...prev,
      {
        id: `heal-${Date.now()}`,
        message: `${getMageName(data.targetId)} recovered ${
          data.amount
        } health!`,
        type: "heal",
        timestamp: Date.now(),
      },
    ]);
  });

  // Listen for status application
  useGameEvent(GameEventType.STATUS_APPLIED, (data) => {
    setBattleLog((prev) => [
      ...prev,
      {
        id: `status-${Date.now()}`,
        message: `${getMageName(data.targetId)} was afflicted with ${
          data.statusType
        } for ${data.duration} turns!`,
        type: "status",
        timestamp: Date.now(),
      },
    ]);
  });

  // Listen for mage defeat
  useGameEvent(GameEventType.MAGE_DEFEATED, (data) => {
    setBattleLog((prev) => [
      ...prev,
      {
        id: `defeat-${Date.now()}`,
        message: `${getMageName(data.mageId)} has been defeated!`,
        type: "defeat",
        timestamp: Date.now(),
      },
    ]);
  });

  // Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    const logContainer = document.getElementById("battle-log-container");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [battleLog]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Battle Log</h2>
      <div
        id="battle-log-container"
        className="p-4 bg-gray-50 rounded max-h-60 overflow-y-auto"
      >
        {battleLog.length === 0 ? (
          <p className="text-center text-gray-500">
            Preparing to execute spells...
          </p>
        ) : (
          <ul className="space-y-2">
            {battleLog.map((entry) => (
              <li
                key={entry.id}
                className={`p-2 rounded transition-all duration-300 animate-fadeIn ${
                  entry.type === "damage"
                    ? "bg-red-100"
                    : entry.type === "critical"
                    ? "bg-orange-100 font-bold"
                    : entry.type === "heal"
                    ? "bg-green-100"
                    : entry.type === "status"
                    ? "bg-purple-100"
                    : entry.type === "spell"
                    ? "bg-blue-100"
                    : entry.type === "affinity"
                    ? "bg-yellow-100"
                    : entry.type === "defeat"
                    ? "bg-gray-100 font-bold"
                    : ""
                }`}
              >
                {entry.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
