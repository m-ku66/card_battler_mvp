// app/core/models/Game.ts
import { Mage } from "./Mage";
import { Player } from "./Player";
import { Spell } from "./Spell";
import { Grimoire } from "./Grimoire";
import { GameEventType } from "../events/Events";

export type GamePhase = "preparation" | "battle" | "result";
export type BattlePhase = "spellSelection" | "execution";
export type CombatLogEntry = {
  id: string;
  eventType: GameEventType;
  data: any; // We'll store the original event data
  timestamp: number;
};
export interface ChargingSpell {
  playerId: string;
  mageId: string;
  spellId: string;
  remainingTurns: number;
  isInnate: boolean;
}

export interface GameState {
  phase: GamePhase;
  battlePhase: BattlePhase;
  players: Player[];
  mages: Record<string, Mage>; // All mages in the game keyed by ID
  grimoires: Record<string, Grimoire>; // All grimoires in the game keyed by ID
  spells: Record<string, Spell>; // All spells in the game keyed by ID
  currentTurn: number;
  turnOrder: string[]; // Player IDs in order of their turn
  winner: string | null;
  spellUsesRemaining: Record<string, Record<string, number>>; // playerId -> spellId -> uses remaining
  combatLog: CombatLogEntry[]; // Log of all combat events
  chargingSpells: ChargingSpell[]; // Spells that are currently charging
  readyChargedSpells: ChargingSpell[]; // A queue of spells that are ready to be cast
}
