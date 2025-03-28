export interface Player {
  id: string;
  name: string;
  selectedMageId: string | null;
  studentRoster: string[]; // Roster of mages available to this player
  selectedGrimoireIds: string[];
  selectedSpellId: string | null; // Currently selected spell for this turn
}

/**
 * ABOUT PLAYERS
 * In this game, the player is a sorcerer tutor who teaches student sorcerers
 * During the preparation phase of a battle, the player selects a mage and the grimoire that mage will use
 * Grimoires contain spell cards that mages can cast during battle
 */
