export type OmitId<T> = Omit<T, '_id'>;

export type OmitMongoFields<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;
