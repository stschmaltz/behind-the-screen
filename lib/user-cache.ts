import { UserObject } from '../types/user';

interface CacheEntry {
  data: UserObject;
  timestamp: number;
}
export class UserCache {
  private cache = new Map<string, CacheEntry>();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
    this.startCleanupInterval();
  }

  get(auth0Id: string): UserObject | null {
    const entry = this.cache.get(auth0Id);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(auth0Id);

      return null;
    }

    return entry.data;
  }

  set(auth0Id: string, user: UserObject): void {
    this.cache.set(auth0Id, {
      data: user,
      timestamp: Date.now(),
    });
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.ttl) {
          this.cache.delete(key);
        }
      }
    }, this.ttl);
  }
}
