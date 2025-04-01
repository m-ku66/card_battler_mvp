import { Mage } from "../core/models/Mage";

// Define all mages in the game
export const mages: Record<string, Mage> = {
  idlad_001: {
    id: "idlad_001",
    name: "Idlad",
    health: 120,
    maxHealth: 120,
    magia: 100,
    maxMagia: 100,
    magiaRegenRate: 10,
    agility: 10,
    resistance: 5,
    wisdom: 12,
    attackPower: 50,
    affinity: "fire",
    personality: "aggressive",
    innateSpellId: "rhaz_001",
    grimoireIds: ["fire_001"],
  },
  inaui_001: {
    id: "inaui_001",
    name: "Inaui",
    health: 95,
    maxHealth: 95,
    magia: 120,
    maxMagia: 120,
    magiaRegenRate: 15,
    agility: 20,
    resistance: 15,
    wisdom: 12,
    attackPower: 15,
    affinity: "water",
    personality: "defensive",
    innateSpellId: "akua_001",
    grimoireIds: ["water_001"],
  },
  narnrokhar_001: {
    id: "narnrokhar_001",
    name: "Narnrokhar",
    health: 130,
    maxHealth: 130,
    magia: 80,
    maxMagia: 80,
    magiaRegenRate: 5,
    agility: 5,
    resistance: 30,
    wisdom: 5,
    attackPower: 35,
    affinity: "earth",
    personality: "supportive",
    innateSpellId: "teryolk_001",
    grimoireIds: ["earth_001"],
  },
  surha_001: {
    id: "surha_001",
    name: "Surha",
    health: 90,
    maxHealth: 90,
    magia: 130,
    maxMagia: 130,
    magiaRegenRate: 15,
    agility: 30,
    resistance: 11,
    wisdom: 30,
    attackPower: 10,
    affinity: "wind",
    personality: "cunning",
    innateSpellId: "zephyr_001",
    grimoireIds: ["wind_001"],
  },
  zkilliam_001: {
    id: "zkilliam_001",
    name: "Zkilliam",
    health: 100,
    maxHealth: 100,
    magia: 100,
    maxMagia: 100,
    magiaRegenRate: 20,
    agility: 30,
    resistance: 12,
    wisdom: 45,
    attackPower: 25,
    affinity: "lightning",
    personality: "aggressive",
    innateSpellId: "bolt_001",
    grimoireIds: ["lightning_001"],
  },
};
