"use client";

export default function ExecutionPanel() {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Spells Executing...</h2>
      <div className="p-4 bg-gray-50 rounded">
        <p>Watch as the spells take effect!</p>
        {/* We could add animations or visual effects here */}
      </div>
    </div>
  );
}
