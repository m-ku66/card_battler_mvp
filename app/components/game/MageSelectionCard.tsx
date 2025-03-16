"use client";
import { Mage } from "@/app/core/models/Mage";

interface MageSelectionCardProps {
  mage: Mage;
  isSelected: boolean;
  onSelect: (mageId: string) => void;
}

export default function MageSelectionCard({
  mage,
  isSelected,
  onSelect,
}: MageSelectionCardProps) {
  return (
    <div
      className={`border rounded-md p-4 cursor-pointer transition-all${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-300"
      }`}
      onClick={() => onSelect(mage.id)}
    >
      <h3 className="font-bold text-lg">{mage.name}</h3>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>Health: {mage.health}</div>
        <div>Magia: {mage.magia}</div>
        <div>Attack: {mage.attackPower}</div>
        <div>Agility: {mage.agility}</div>
        <div className="col-span-2">
          Affinity: <span className="capitalize">{mage.affinity}</span>
        </div>
        <div className="col-span-2">
          Personality: <span className="capitalize">{mage.personality}</span>
        </div>
      </div>
    </div>
  );
}
