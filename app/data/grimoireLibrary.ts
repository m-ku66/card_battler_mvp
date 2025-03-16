import { Grimoire } from "../core/models/Grimoire";

// Define all grimoires in the game
export const grimoires: Record<string, Grimoire> = {
  grimoire1: {
    id: "grimoire1",
    name: "Pyromancer's Tome",
    description: "A grimoire filled with fire spells",
    spellIds: ["spell1"],
  },
  grimoire2: {
    id: "grimoire2",
    name: "Aquamancer's Tome",
    description: "A grimoire filled with water spells",
    spellIds: ["spell2"],
  },
  grimoire3: {
    id: "grimoire3",
    name: "Terramancer's Tome",
    description: "A grimoire filled with earth spells",
    spellIds: ["spell3"],
  },
  grimoire4: {
    id: "grimoire4",
    name: "Aeromancer's Tome",
    description: "A grimoire filled with wind spells",
    spellIds: ["spell4"],
  },
};
