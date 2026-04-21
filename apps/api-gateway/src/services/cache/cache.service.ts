export interface CacheService {
  get<TValue>(key: string): Promise<TValue | null>;
  set<TValue>(key: string, value: TValue, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
}
