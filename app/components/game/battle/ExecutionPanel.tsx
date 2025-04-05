"use client";
import { useState, useEffect } from "react";
import { GameEventType } from "@/app/core/events/Events";
import { useGameStore } from "@/app/store/gameStore";
import { CombatLogEntry } from "@/app/core/models/Game";

export default function ExecutionPanel() {
  const { gameState } = useGameStore();
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  // Helper to get mage name from ID
  const getMageName = (mageId: string) => {
    return gameState.mages[mageId]?.name || mageId;
  };

  // Helper to get spell name from ID
  const getSpellName = (spellId: string) => {
    return gameState.spells[spellId]?.name || spellId;
  };

  // Format a combat log entry into a human-readable message
  // In ExecutionPanel.tsx
  const formatLogEntry = (entry: CombatLogEntry) => {
    const { eventType, data } = entry;

    switch (eventType) {
      case GameEventType.SPELL_CAST:
        return `${getMageName(data.casterId)} cast ${getSpellName(
          data.spellId
        )}!`;

      case GameEventType.DAMAGE_DEALT:
        return `${getMageName(data.sourceId)} dealt ${
          data.amount
        } damage to ${getMageName(data.targetId)}!`;

      case GameEventType.MAGIA_CONSUMED:
        return `${getMageName(data.mageId)} used ${data.amount} magia points!`;

      case GameEventType.HEALING_RECEIVED:
        return `${getMageName(data.targetId)} recovered ${data.amount} health!`;

      case GameEventType.STATUS_APPLIED:
        return `${getMageName(data.targetId)} was afflicted with ${
          data.statusType
        } for ${data.duration} turns!`;

      case GameEventType.MAGE_DEFEATED:
        return `${getMageName(data.mageId)} has been defeated!`;

      default:
        return `Combat action occurred: ${eventType}`;
    }
  };

  // Get the CSS class for an event type
  const getEventClass = (eventType: GameEventType) => {
    switch (eventType) {
      case GameEventType.DAMAGE_DEALT:
        return "bg-red-100";
      case GameEventType.HEALING_RECEIVED:
        return "bg-green-100";
      case GameEventType.STATUS_APPLIED:
        return "bg-purple-100";
      case GameEventType.SPELL_CAST:
        return "bg-blue-100";
      case GameEventType.MAGE_DEFEATED:
        return "bg-gray-100 font-bold";
      default:
        return "";
    }
  };

  // Auto-advance through the log entries with animation
  useEffect(() => {
    if (currentLogIndex < gameState.combatLog.length) {
      const timer = setTimeout(() => {
        setCurrentLogIndex((prev) => prev + 1);
      }, 800); // Show a new message every 800ms

      return () => clearTimeout(timer);
    }
  }, [currentLogIndex, gameState.combatLog.length]);

  // Auto-scroll to the bottom when new entries appear
  useEffect(() => {
    const logContainer = document.getElementById("battle-log-container");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [currentLogIndex]);

  // Only display events up to the current index
  const visibleLogEntries = gameState.combatLog.slice(0, currentLogIndex);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Battle Log</h2>
      <div
        id="battle-log-container"
        className="p-4 bg-gray-50 rounded max-h-60 overflow-y-auto"
      >
        {visibleLogEntries.length === 0 ? (
          <p className="text-center text-gray-500">
            {gameState.combatLog.length > 0
              ? "Executing spells..."
              : "Preparing for combat..."}
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleLogEntries.map((entry) => (
              <li
                key={entry.id}
                className={`p-2 rounded transition-all duration-300 animate-fadeIn ${getEventClass(
                  entry.eventType
                )}`}
              >
                {formatLogEntry(entry)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
