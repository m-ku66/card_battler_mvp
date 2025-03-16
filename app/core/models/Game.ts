import { Mage } from "./Mage";
import { Player } from "./Player";
import { Spell } from "./Spell";
import { Grimoire } from "./Grimoire";

export type GamePhase = "preparation" | "battle" | "result";
export type BattlePhase = "spellSelection" | "execution";

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
}
