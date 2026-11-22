const DEFAULT_MAX_ENTRIES = 500;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CachedValue<T> {
  value: T;
  stale: boolean;
}

export class MarketDataCache {
  private entries = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();

  constructor(
    private readonly maxEntries = DEFAULT_MAX_ENTRIES,
    private readonly now: () => number = Date.now
  ) {}

  isFresh(key: string) {
    const entry = this.entries.get(key);

    return entry !== undefined && entry.expiresAt > this.now();
  }

  isLoading(key: string) {
    return this.inFlight.has(key);
  }

  // Serving an expired entry when the loader fails is deliberate: a stale price beats a broken page.
  async getOrLoad<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<CachedValue<T>> {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (entry && entry.expiresAt > this.now()) {
      return { value: entry.value, stale: false };
    }

    try {
      const value = await this.loadOnce(key, ttlMs, load);

      return { value, stale: false };
    } catch (error) {
      if (entry) {
        return { value: entry.value, stale: true };
      }

      throw error;
    }
  }

  private loadOnce<T>(key: string, ttlMs: number, load: () => Promise<T>) {
    const pending = this.inFlight.get(key) as Promise<T> | undefined;

    if (pending) {
      return pending;
    }

    const started = load()
      .then(value => {
        this.store(key, value, ttlMs);

        return value;
      })
      .finally(() => this.inFlight.delete(key));

    this.inFlight.set(key, started);

    return started;
  }

  private store<T>(key: string, value: T, ttlMs: number) {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + ttlMs });

    if (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value as string;

      this.entries.delete(oldestKey);
    }
  }
}
