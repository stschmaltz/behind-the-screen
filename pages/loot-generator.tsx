import { NextPage } from 'next';
import { useState } from 'react';
import { FormInput } from '../components/ui/FormInput';
import { Button } from '../components/ui/Button';

type LootItem = { coins?: string; item?: string; note?: string };

const LootGeneratorPage: NextPage = () => {
  const [partyLevel, setPartyLevel] = useState<number>(3);
  const [srdItemCount, setSrdItemCount] = useState<number>(2);
  const [randomItemCount, setRandomItemCount] = useState<number>(0);
  const [context, setContext] = useState<string>('');
  const [loot, setLoot] = useState<LootItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLoot(null);

    try {
      const response = await fetch('/api/generate-loot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partyLevel,
          srdItemCount,
          randomItemCount,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setLoot(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to generate loot.');
      } else {
        setError('An unknown error occurred.');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Loot Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="partyLevel"
          label="Party Level (1-20)"
          type="number"
          value={partyLevel}
          onChange={(e) => setPartyLevel(parseInt(e.target.value))}
          min={1}
          max={20}
          required
          className=""
          disabled={isLoading}
        />
        <FormInput
          id="srdItemCount"
          label="Number of Official Source Items (1-10)"
          type="number"
          value={srdItemCount}
          onChange={(e) => setSrdItemCount(parseInt(e.target.value))}
          min={1}
          max={10}
          required
          className=""
          disabled={isLoading}
        />
        <FormInput
          id="randomItemCount"
          label="Number of Random Items (0-10)"
          type="number"
          value={randomItemCount}
          onChange={(e) => setRandomItemCount(parseInt(e.target.value))}
          min={0}
          max={10}
          className=""
          disabled={isLoading}
        />
        <FormInput
          id="context"
          label="Context/Theme (Optional)"
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className=""
          disabled={isLoading}
        />
        <Button
          type="submit"
          label={isLoading ? 'Generating...' : 'Generate Loot'}
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
          className="w-full"
        />
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>Error: {error}</p>
        </div>
      )}

      {loot && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Generated Loot:</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {loot.map((entry, index) => (
              <li key={index}>
                {entry.coins && <strong>Coins: {entry.coins}</strong>}
                {entry.item && <>{entry.item}</>}
                {entry.note && <em>Note: {entry.note}</em>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LootGeneratorPage;
