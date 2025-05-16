import { NextPage } from 'next';
import { useState } from 'react';

const LootGeneratorPage: NextPage = () => {
  const [partyLevel, setPartyLevel] = useState<number>(3);
  const [itemCount, setItemCount] = useState<number>(2);
  const [context, setContext] = useState<string>('');
  const [loot, setLoot] = useState<string[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call the Mastra server
    console.log({ partyLevel, itemCount, context });
    // Mock loot for now
    setLoot([
      'Coins: 35 silver pieces',
      "A candle that can't be lit",
      'Mirror, steel',
      'A petrified mouse',
      'A sack',
      'A tiny glass vial filled with shimmering sand that softly glows in moonlight',
      'A carved wooden whistle shaped like a laughing frog',
      'A delicate chain of interlinked brass leaves that tinkle faintly when moved',
    ]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Loot Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="partyLevel"
            className="block text-sm font-medium text-gray-700"
          >
            Party Level (1-20)
          </label>
          <input
            type="number"
            id="partyLevel"
            value={partyLevel}
            onChange={(e) => setPartyLevel(parseInt(e.target.value))}
            min="1"
            max="20"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="itemCount"
            className="block text-sm font-medium text-gray-700"
          >
            Number of SRD Items (1-10)
          </label>
          <input
            type="number"
            id="itemCount"
            value={itemCount}
            onChange={(e) => setItemCount(parseInt(e.target.value))}
            min="1"
            max="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="context"
            className="block text-sm font-medium text-gray-700"
          >
            Context/Theme (Optional)
          </label>
          <input
            type="text"
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Generate Loot
        </button>
      </form>

      {loot && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Generated Loot:</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {loot.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LootGeneratorPage;
