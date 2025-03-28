import { GamePhase, BattlePhase } from "../models/Game";
import { SpellEffect } from "../models/Spell";

// Define all possible game events
export enum GameEventType {
  // Game flow events
  GAME_INITIALIZED = "game-initialized",
  PHASE_CHANGED = "phase-changed",
  BATTLE_PHASE_CHANGED = "battle-phase-changed",
  TURN_STARTED = "turn-started",
  TURN_ENDED = "turn-ended",

  // Player actions
  MAGE_SELECTED = "mage-selected",
  GRIMOIRE_SELECTED = "grimoire-selected",
  SPELL_SELECTED = "spell-selected",

  // Battle events
  SPELL_CAST = "spell-cast",
  DAMAGE_DEALT = "damage-dealt",
  HEALING_RECEIVED = "healing-received",
  MAGIA_CONSUMED = "magia-consumed",
  MAGIA_REGENERATED = "magia-regenerated",
  STATUS_APPLIED = "status-applied",
  STATUS_REMOVED = "status-removed",

  // Game result events
  MAGE_DEFEATED = "mage-defeated",
  GAME_OVER = "game-over",
}

// Define typings for each event's data payload
export interface GameEventData {
  [GameEventType.GAME_INITIALIZED]: void;
  [GameEventType.PHASE_CHANGED]: {
    previousPhase: GamePhase;
    currentPhase: GamePhase;
  };
  [GameEventType.BATTLE_PHASE_CHANGED]: {
    previousPhase: BattlePhase;
    currentPhase: BattlePhase;
  };
  [GameEventType.TURN_STARTED]: {
    turn: number;
    playerId: string;
  };
  [GameEventType.TURN_ENDED]: {
    turn: number;
    playerId: string;
  };
  [GameEventType.MAGE_SELECTED]: {
    playerId: string;
    mageId: string;
  };
  [GameEventType.GRIMOIRE_SELECTED]: {
    playerId: string;
    grimoireIds: string[];
  };
  [GameEventType.SPELL_SELECTED]: {
    playerId: string;
    spellId: string;
  };
  [GameEventType.SPELL_CAST]: {
    casterId: string;
    targetId: string;
    spellId: string;
    effects: Array<{
      type: SpellEffect["type"];
      value: number;
    }>;
  };
  [GameEventType.DAMAGE_DEALT]: {
    targetId: string;
    amount: number;
    newHealth: number;
    sourceId: string;
    spellId: string;
  };
  [GameEventType.HEALING_RECEIVED]: {
    targetId: string;
    amount: number;
    newHealth: number;
    sourceId: string;
    spellId: string;
  };
  [GameEventType.MAGIA_CONSUMED]: {
    mageId: string;
    amount: number;
    newMagia: number;
  };
  [GameEventType.MAGIA_REGENERATED]: {
    mageId: string;
    amount: number;
    newMagia: number;
  };
  [GameEventType.STATUS_APPLIED]: {
    targetId: string;
    statusType: string;
    duration: number;
    sourceId: string;
  };
  [GameEventType.STATUS_REMOVED]: {
    targetId: string;
    statusType: string;
  };
  [GameEventType.MAGE_DEFEATED]: {
    mageId: string;
    playerId: string;
  };
  [GameEventType.GAME_OVER]: {
    winnerId: string;
    reason: string;
  };
}
