import { ElementalAffinity } from "./Mage";
export interface Grimoire {
  id: string;
  name: string;
  description: string;
  spellIds: string[];
  affinity: ElementalAffinity; // Elemental affinity of the grimoire
}
