import type { ElementalAffinity } from "./Mage";
export type SpellType = "attack" | "utility";

export interface Spell {
  id: string;
  name: string;
  description: string;
  magiaCost: number;
  basePower: number;
  castingTime: number; // Affects turn order priority. The number is the number of turns it takes to cast the spell 0 = instant cast
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
 * Base power is the percentage of how much of the mage's power is used to calculate the spell's effectiveness/damage'
 * Example: A mage with 100 attack power casting a spell with 50 base power will deal 50 damage(50% of 100)
 *
 * Damage should be calculated as follows:
 * 1. Calculate the base damage: basePower * caster.attackPower
 * 2. Apply the affinity multiplier: baseDamage * affinityMultiplier
 *
 * The value on a spell effect refers to the DOT or the amount of the effect. It's irrelevant for initial damage/healing
 */

export interface SpellEffect {
  type: "damage" | "heal" | "buff" | "debuff" | "status";
  target: "self" | "opponent" | "all" | "allies" | "enemies" | "random";
  name?: string; // Optional name for the effect
  description?: string; // Optional description for the effect
  value: number; // The value of the effect, can be a percentage(0.5 = 50%) or a fixed value(50 = 50)
  duration?: number;
}
