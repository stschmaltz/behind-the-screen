import InactiveEncounterTable from './InactiveEncounter/InactiveEncounterTable';
import { ActiveEncounterTable } from './ActiveEncounter/ActiveEncounterTable';
import { Player } from '../../../types/player';
import { useEncounterContext } from '../../../context/EncounterContext';

const EncounterContent = ({ players }: { players: Player[] }) => {
  const { encounter } = useEncounterContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl font-bold">{encounter.name}</h1>

          <div className="my-4">
            <div
              className={`badge badge-lg ${
                encounter.status === 'active'
                  ? 'badge-primary'
                  : 'badge-secondary'
              }`}
            >
              {encounter.status.charAt(0).toUpperCase() +
                encounter.status.slice(1)}
            </div>
          </div>

          <div className="overflow-x-auto">
            {encounter.status === 'active' ? (
              <ActiveEncounterTable players={players} />
            ) : (
              <InactiveEncounterTable encounter={encounter} players={players} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterContent;
