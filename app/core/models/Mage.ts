export type ElementalAffinity =
  | "fire"
  | "water"
  | "wind"
  | "earth"
  | "lightning";
/**
 * ABOUT AFFINITIES
 * water beats fire(x1.5 damage)
 * fire beats earth(x1.2 damage)
 * earth resists lightning(ignores 50% of damage)
 * lightning beats water(x1.5 damage)
 * wind beats earth(x1.2 damage)
 * All other elemental matchups are neutral(x1 damage)
 */

export type Personality =
  | "aggressive"
  | "defensive"
  | "balanced"
  | "cunning"
  | "supportive";
/**
 * ABOUT PERSONALITIES
 * Aggressive: +10% attack power, -10% resistance
 * Defensive: +10% resistance, -10% attack power
 * Balanced: +5% attack power, +5% resistance
 * Cunning: +5% attack power, +5% agility
 * Supportive: +5% resistance, +5% magia regen rate
 */

export interface Mage {
  id: string; // ID of this mage
  name: string; // Name of this mage
  health: number; // Current health
  maxHealth: number; // Maximum health
  magia: number; // Current magia
  maxMagia: number; // Maximum magia
  magiaRegenRate: number; // Magia regen rate per turn
  agility: number; // Speed of this mage, determines turn order
  resistance: number; // Resistance to spell damage
  wisdom: number; // Critical hit chance
  attackPower: number; // Base damage of spells
  affinity: ElementalAffinity; // Elemental affinity
  personality: Personality; // Personality
  innateSpellId: string; // ID of this mage's spell that they can cast unlimited times with 50% magia cost reduction
  grimoireIds: string[]; // IDs of spell cards in this mage's grimoire
}
