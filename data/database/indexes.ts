import type { Db, IndexSpecification } from 'mongodb';
import { logger } from '../../lib/logger';

export const COLLECTION_INDEXES: Record<string, IndexSpecification[]> = {
  encounters: [{ userId: 1, createdAt: -1 }],
  campaigns: [{ userId: 1 }],
  adventures: [{ userId: 1, campaignId: 1 }],
  players: [{ userId: 1 }],
  users: [{ auth0Id: 1 }],
  userPreferences: [{ userId: 1 }],
  loot_generations: [{ userId: 1, timestamp: -1 }],
  npc_generations: [{ userId: 1, timestamp: -1 }],
};

export const ensureIndexes = async (db: Db): Promise<void> => {
  const results = await Promise.allSettled(
    Object.entries(COLLECTION_INDEXES).flatMap(([collection, indexes]) =>
      indexes.map((index) => db.collection(collection).createIndex(index)),
    ),
  );

  results
    .filter((result) => result.status === 'rejected')
    .forEach((result) =>
      logger.error('Could not create a database index', {
        reason: String((result as PromiseRejectedResult).reason),
      }),
    );
};
