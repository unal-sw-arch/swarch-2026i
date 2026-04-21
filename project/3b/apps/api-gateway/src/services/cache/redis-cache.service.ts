import type { CacheService } from './cache.service';
import type { RedisClient } from './redis.factory';

export class RedisCacheService implements CacheService {
  constructor(private readonly client: RedisClient) {}

  public async get<TValue>(key: string): Promise<TValue | null> {
    const value = await this.client.get(key);
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as TValue;
    } catch {
      return null;
    }
  }

  public async set<TValue>(key: string, value: TValue, ttlSeconds = 60): Promise<void> {
    const serializedValue = JSON.stringify(value);

    await this.client.set(key, serializedValue, { EX: ttlSeconds });
  }

  public async delete(key: string): Promise<boolean> {
    const deleted = await this.client.del(key);
    return deleted > 0;
  }
}
