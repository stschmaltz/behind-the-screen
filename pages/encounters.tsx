import Link from 'next/link';

export default function Encounters() {
  return (
    <div className="flex h-full items-center justify-center flex-col">
      <div>Encounters</div>
      <Link href="/encounters/new">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          New Encounter
        </button>
      </Link>
      <ul className="list-disc">
        <li>Encounter 1</li>
        <li>Encounter 2</li>
        <li>Encounter 3</li>
      </ul>
    </div>
  );
}
