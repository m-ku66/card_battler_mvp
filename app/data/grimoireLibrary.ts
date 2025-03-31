import { Grimoire } from "../core/models/Grimoire";

// Define all grimoires in the game
export const grimoires: Record<string, Grimoire> = {
  "fire_001": {
    id: "fire_001",
    name: "Pyromancer's Tome",
    description: "A grimoire filled with fire spells",
    spellIds: ["rhaz_001", "rhazia_001", "rhazlef_001"],
    affinity: "fire",
  },
  "water_001": {
    id: "water_001",
    name: "Aquamancer's Tome",
    description: "A grimoire filled with water spells",
    spellIds: ["akua_001", "bhurka_001", "nuct_001"],
    affinity: "water",
  },
  "earth_001": {
    id: "earth_001",
    name: "Terramancer's Tome",
    description: "A grimoire filled with earth spells",
    spellIds: ["teryolk_001", "earthquake_001"],
    affinity: "earth",
  },
  "wind_001": {
    id: "wind_001",
    name: "Aeromancer's Tome",
    description: "A grimoire filled with wind spells",
    spellIds: ["zephyr_001"],
    affinity: "wind",
  },
};
