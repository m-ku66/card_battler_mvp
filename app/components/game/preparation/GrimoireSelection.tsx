// "use client";
// import { Player } from "@/app/core/models/Player";
// import { GameState } from "@/app/core/models/Game";
// import GrimoireSelectionCard from "../GrimoireSelectionCard";

// interface GrimoireSelectionProps {
//   gameState: GameState;
//   player: Player;
//   onSelectGrimoire: (grimoireIds: string[]) => void;
//   onBack: () => void;
//   onStartBattle: () => void;
// }

// export default function GrimoireSelection({
//   gameState,
//   player,
//   onSelectGrimoire,
//   onBack,
//   onStartBattle,
// }: GrimoireSelectionProps) {
//   // Get selected mage
//   const selectedMage = player.selectedMageId
//     ? gameState.mages[player.selectedMageId]
//     : null;

//   // Get grimoires for the selected mage
//   const availableGrimoires = selectedMage
//     ? selectedMage.grimoireIds
//         .map((id) => gameState.grimoires[id])
//         .filter(Boolean)
//     : [];

//   return (
//     <>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Select a Grimoire</h2>
//         <button onClick={onBack} className="text-blue-500 hover:underline">
//           ← Back to Mage Selection
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {availableGrimoires.map((grimoire) => (
//           <GrimoireSelectionCard
//             key={grimoire.id}
//             grimoire={grimoire}
//             spells={gameState.spells}
//             isSelected={player.selectedGrimoireIds.includes(grimoire.id)}
//             onSelect={(grimoireId) => onSelectGrimoire([grimoireId])}
//           />
//         ))}
//       </div>

//       <button
//         onClick={onStartBattle}
//         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//         disabled={player.selectedGrimoireIds.length === 0}
//       >
//         Start Battle
//       </button>
//     </>
//   );
// }

// components/game/preparation/GrimoireSelection.tsx
"use client";
import { Player } from "@/app/core/models/Player";
import { GameState } from "@/app/core/models/Game";
import GrimoireSelectionCard from "../GrimoireSelectionCard";

interface GrimoireSelectionProps {
  gameState: GameState;
  player: Player;
  onSelectGrimoire: (grimoireIds: string[]) => void;
  onBack: () => void;
  onStartBattle: () => void;
}

export default function GrimoireSelection({
  gameState,
  player,
  onSelectGrimoire,
  onBack,
  onStartBattle,
}: GrimoireSelectionProps) {
  // Get selected mage
  const selectedMage = player.selectedMageId
    ? gameState.mages[player.selectedMageId]
    : null;

  console.log("Selected mage:", selectedMage);
  console.log("Selected mage grimoire IDs:", selectedMage?.grimoireIds);
  console.log("Available grimoires in state:", gameState.grimoires);

  // Get grimoires for the selected mage
  const availableGrimoires = selectedMage
    ? selectedMage.grimoireIds
        .map((id) => {
          console.log(`Looking for grimoire with id: ${id}`);
          const grimoire = gameState.grimoires[id];
          console.log(`Found grimoire:`, grimoire);
          return grimoire;
        })
        .filter(Boolean)
    : [];

  console.log("Available grimoires after mapping:", availableGrimoires);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select a Grimoire</h2>
        <button onClick={onBack} className="text-blue-500 hover:underline">
          ← Back to Mage Selection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableGrimoires.map((grimoire) => (
          <GrimoireSelectionCard
            key={grimoire.id}
            grimoire={grimoire}
            spells={gameState.spells}
            isSelected={player.selectedGrimoireIds.includes(grimoire.id)}
            onSelect={(grimoireId) => onSelectGrimoire([grimoireId])}
          />
        ))}
      </div>

      <button
        onClick={onStartBattle}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={player.selectedGrimoireIds.length === 0}
      >
        Start Battle
      </button>
    </>
  );
}
