import { Grimoire } from "../core/models/Grimoire";

// Define all grimoires in the game
export const grimoires: Record<string, Grimoire> = {
  fire_001: {
    id: "fire_001",
    name: "Pyromancer's Tome",
    description: "A grimoire filled with fire spells",
    spellIds: ["rhaz", "rhazia", "rhazlef"],
    affinity: "fire",
  },
  water_001: {
    id: "water_001",
    name: "Aquamancer's Tome",
    description: "A grimoire filled with water spells",
    spellIds: ["akua", "bhurka", "nuct"],
    affinity: "water",
  },
  earth_001: {
    id: "earth_001",
    name: "Terramancer's Tome",
    description: "A grimoire filled with earth spells",
    spellIds: ["teryolk", "earthquake"],
    affinity: "earth",
  },
  wind_001: {
    id: "wind_001",
    name: "Aeromancer's Tome",
    description: "A grimoire filled with wind spells",
    spellIds: ["zephyr"],
    affinity: "wind",
  },
};
