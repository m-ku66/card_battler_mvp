import type { ElementalAffinity } from "./Mage";
export type SpellType = "attack" | "utility";

export interface Spell {
  id: string;
  name: string;
  description: string;
  magiaCost: number;
  basePower: number;
  castingTime: number; // Affects turn order priority
  type: SpellType;
  affinity: ElementalAffinity;
  effects: SpellEffect[];
  usesPerBattle?: number; // Optional limit on uses
}

/**
 * ABOUT SPELLS
 * Spells are the primary way mages interact with the game
 * If a mage runs out of spell uses, they can only use their innate spell
 * Spells can have multiple effects, such as damage, healing, buffs, debuffs, or status effects(like paralyze, burn, etc)
 * Spells can be cast by any mage regardless of affinity, but they are less effective when cast by a mage with a different affinity(50% damage reduction)
 */

export interface SpellEffect {
  type: "damage" | "heal" | "buff" | "debuff" | "status";
  target: "self" | "opponent" | "all" | "allies" | "enemies" | "random";
  value: number;
  duration?: number;
}
