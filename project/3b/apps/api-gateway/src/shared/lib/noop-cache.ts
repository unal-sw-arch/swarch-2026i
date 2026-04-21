import type { CacheService } from '../../services/cache/cache.service';

export class NoopCacheService implements CacheService {
  public async get<TValue>(_key: string): Promise<TValue | null> {
    return null;
  }

  public async set<TValue>(_key: string, _value: TValue, _ttlSeconds?: number): Promise<void> {
    return;
  }

  public async delete(_key: string): Promise<boolean> {
    return false;
  }
}
