"use client";
import { Grimoire } from "@/app/core/models/Grimoire";
import { Spell } from "@/app/core/models/Spell";

interface GrimoireSelectionCardProps {
  grimoire: Grimoire;
  spells: Record<string, Spell>;
  isSelected: boolean;
  onSelect: (grimoireId: string) => void;
}

export default function GrimoireSelectionCard({
  grimoire,
  spells,
  isSelected,
  onSelect,
}: GrimoireSelectionCardProps) {
  return (
    <div
      className={`border rounded-md p-4 cursor-pointer transition-all
                 ${
                   isSelected
                     ? "border-blue-500 bg-blue-50"
                     : "border-gray-300 hover:border-blue-300"
                 }`}
      onClick={() => onSelect(grimoire.id)}
    >
      <h3 className="font-bold text-lg">{grimoire.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{grimoire.description}</p>

      <div className="mt-2">
        <h4 className="font-semibold text-sm">Spells:</h4>
        <ul className="text-sm">
          {grimoire.spellIds.map((spellId) => {
            const spell = spells[spellId];
            return spell ? (
              <li key={spellId} className="mt-1">
                • {spell.name} - {spell.description}
              </li>
            ) : null;
          })}
        </ul>
      </div>
    </div>
  );
}
