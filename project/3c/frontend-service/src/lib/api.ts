/**
 * GameSeeker API client
 *
 * Thin typed fetch wrapper around the API gateway.
 * Base URL is read from NEXT_PUBLIC_GATEWAY_URL at build/runtime.
 * All requests include credentials so session cookies are forwarded.
 */

// Server-side (SSR/RSC): use internal Docker hostname via GATEWAY_URL.
// Client-side (browser): GATEWAY_URL is undefined, fall back to NEXT_PUBLIC_GATEWAY_URL.
const BASE_URL =
  process.env.GATEWAY_URL ??
  process.env.NEXT_PUBLIC_GATEWAY_URL ??
  'http://localhost:8080';

// ---------------------------------------------------------------------------
// Raw scrapper response types (as returned by scrapper-service)
// ---------------------------------------------------------------------------

interface ScrapperResult {
  name: string;
  store: string;
  price_cents: number;
  original_price_cents: number;
  currency: string;
  url: string;
  imageUrl?: string;
}

interface ScrapperSearchResponse {
  game: string;
  results: ScrapperResult[];
}

interface ScrapperCompareResponse {
  game: string;
  prices: ScrapperResult[];
  cheapest: ScrapperResult;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function normalizeStore(raw: ScrapperResult): StorePriceSummary {
  return {
    store: raw.store,
    price: raw.price_cents / 100,
    originalPrice: raw.original_price_cents / 100,
    currency: raw.currency,
    url: raw.url,
    inStock: true,
  };
}

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GameSummary {
  name: string;
  slug: string;
  coverImage?: string;
  /** Lowest price found across all stores */
  lowestPrice?: number;
  currency?: string;
  stores: StorePriceSummary[];
}

export interface StorePriceSummary {
  store: string;
  price: number | null;
  originalPrice?: number | null;
  currency: string;
  url: string;
  inStock: boolean;
}

export interface GameDetails extends GameSummary {
  description?: string;
  releaseDate?: string;
  genres?: string[];
  developer?: string;
  publisher?: string;
}

export interface TrendingGame {
  name: string;
  slug: string;
  coverImage?: string;
  price?: number;
  currency?: string;
  store: string;
  url: string;
}

export interface WishlistGame {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  storeUrl: string;
  store: string;
  priceAtAdd?: number;
  currency?: string;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  games: WishlistGame[];
}

export interface RankedGame {
  rank: number;
  name: string;
  slug: string;
  store: string;
  priceCents: number;
  originalPriceCents: number;
  currency: string;
  discountPct: number;
  url: string;
  imageUrl?: string;
}

export interface RankingResponse {
  generatedAt: string;
  store: string;
  count: number;
  rankings: RankedGame[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  user: AuthUser;
  expiresAt: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error: ApiError = {
      message:
        (errorBody as { message?: string }).message ??
        `HTTP ${response.status}`,
      status: response.status,
    };
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Scrapper / game data endpoints
// ---------------------------------------------------------------------------

/**
 * Search games by name across all stores.
 * Maps to: GET /api/v1/games/search?name=<name>
 */
export async function searchGames(name: string): Promise<GameSummary[]> {
  const params = new URLSearchParams({ name });
  const raw = await apiFetch<ScrapperSearchResponse>(`/api/games/search?${params}`);
  const stores = raw.results.map(normalizeStore);
  const lowest = stores.reduce<StorePriceSummary | undefined>(
    (min, s) => (s.price != null && (min == null || s.price < (min.price ?? Infinity)) ? s : min),
    undefined,
  );

  const imageUrl = raw.results.find(r => r.store === 'Steam')?.imageUrl
    ?? raw.results.find(r => r.imageUrl)?.imageUrl;
  return [
    {
      name: raw.results[0]?.name ?? raw.game,
      slug: nameToSlug(raw.game),
      coverImage: imageUrl,
      lowestPrice: lowest?.price ?? undefined,
      currency: lowest?.currency,
      stores,
    },
  ];
}

/**
 * Compare prices for a specific game across all stores.
 * Maps to: GET /api/v1/games/compare?name=<name>
 */
export async function compareGame(name: string): Promise<GameDetails> {
  const params = new URLSearchParams({ name });
  const raw = await apiFetch<ScrapperCompareResponse>(`/api/games/compare?${params}`);
  const stores = raw.prices.map(normalizeStore);
  const lowest = normalizeStore(raw.cheapest);

  const imageUrl = raw.prices.find(p => p.store === 'Steam')?.imageUrl
    ?? raw.prices.find(p => p.imageUrl)?.imageUrl;

  console.log('compareGame prices:', raw.prices);
  console.log('imageUrl found:', imageUrl);

  return {
    name: raw.prices[0]?.name ?? raw.game,
    slug: nameToSlug(raw.game),
    lowestPrice: lowest.price ?? undefined,
    currency: lowest.currency,
    coverImage: imageUrl,
    stores,
  };
}

/**
 * Get trending games from a specific store.
 * Maps to: GET /api/v1/games/trending/<store>
 * @param store - 'steam' | 'epic' | 'gog' | 'microsoft'
 */
export async function getTrending(store: string): Promise<TrendingGame[]> {
  return apiFetch<TrendingGame[]>(`/api/games/trending/${store}`);
}

// ---------------------------------------------------------------------------
// Auth endpoints (user-service via gateway)
// ---------------------------------------------------------------------------

type AuthUserPayload = AuthUser & {
  createdAt?: string;
  updatedAt?: string;
  emailVerified?: boolean;
};

type LoginApiResponse =
  | {
      redirect?: boolean;
      token: string;
      user: AuthUserPayload;
    }
  | {
      success: boolean;
      data: {
        user: AuthUserPayload;
        token: string;
      };
    };

type SessionApiResponse =
  | {
      user: AuthUser;
      session: {
        expiresAt: string;
      };
    }
  | {
      success: boolean;
      data: {
        user: AuthUser;
        session: {
          expiresAt: string;
        };
      };
    };

function normalizeAuthUser(user: AuthUserPayload): AuthUser {
  const { id, name, email, image } = user;
  return { id, name, email, image: image ?? undefined };
}

/**
 * Sign in with email and password.
 * Maps to: POST /api/auth/sign-in/email
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await apiFetch<LoginApiResponse>(
    '/api/auth/sign-in/email',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  );

  const user = 'data' in res ? res.data.user : res.user;
  return normalizeAuthUser(user);
}

/**
 * Register a new account.
 * Maps to: POST /api/auth/sign-up/email
 */
export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  // Register the user
  await apiFetch<{ success: boolean; data: unknown }>(
    '/api/auth/sign-up/email',
    {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    },
  );
  // Signup doesn't create a session — auto-login to get one
  return login(email, password);
}

/**
 * Sign out the current session.
 * Maps to: POST /api/auth/sign-out
 */
export async function logout(): Promise<void> {
  return apiFetch<void>('/api/auth/sign-out', { method: 'POST' });
}

/**
 * Retrieve the current authenticated session.
 * Returns null when unauthenticated instead of throwing.
 * Maps to: GET /api/auth/get-session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const raw = await apiFetch<SessionApiResponse>('/api/auth/get-session');
    const data = 'data' in raw ? raw.data : raw;

    return {
      user: data.user,
      expiresAt: data.session.expiresAt,
    };
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 401 || apiErr.status === 403) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Wishlist endpoints (user-service via gateway)
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's wishlist.
 * Maps to: GET /api/wishlist
 */
export async function getWishlist(): Promise<Wishlist> {
  const raw = await apiFetch<{
    success: boolean;
    data: {
      userId: string;
      createdAt: string;
      games: Array<{ id: string; gameId: string; gameName: string; addedAt: string; imageUrl?: string; }>;
    } | null;
  }>('/api/wishlist');

  const data = raw.data ?? { userId: '', createdAt: '', games: [] };
  return {
    id: data.userId,
    userId: data.userId,
    games: data.games.map((g) => ({
      id: g.id,
      name: g.gameName,
      slug: g.gameId,
      coverImage: (g as any).imageUrl ?? undefined,
      storeUrl: '',
      store: 'steam',
      addedAt: g.addedAt,
    })),
  };
}

/**
 * Add a game to the wishlist.
 * Maps to: POST /api/wishlist/games
 */
export async function addToWishlist(gameData: {
  name: string;
  slug: string;
  coverImage?: string;
  storeUrl: string;
  store: string;
  priceAtAdd?: number;
  currency?: string;
}): Promise<WishlistGame> {
  const session = await getSession();
  if (!session) throw { message: 'Unauthenticated', status: 401 } as ApiError;

  const raw = await apiFetch<{ success: boolean; data: { id: string; gameId: string; gameName: string; addedAt: string; imageUrl?: string } }>(
    '/api/wishlist/games',
    {
      method: 'POST',
      body: JSON.stringify({
        name: gameData.name,
        slug: gameData.slug,
        imageUrl: gameData.coverImage ?? null,
      }),
    },
  );
  

  return {
    id: raw.data.id,
    name: raw.data.gameName,
    slug: raw.data.gameId,
    coverImage: raw.data.imageUrl ?? gameData.coverImage,
    storeUrl: gameData.storeUrl,
    store: gameData.store,
    priceAtAdd: gameData.priceAtAdd,
    currency: gameData.currency,
    addedAt: raw.data.addedAt,
  };
}

/**
 * Remove a game from the wishlist by its ID.
 * Maps to: DELETE /api/wishlist/games/<gameId>
 */
export async function removeFromWishlist(gameId: string): Promise<void> {
  return apiFetch<void>(`/api/wishlist/games/${gameId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Ranking endpoints (ranking-service via gateway)
// ---------------------------------------------------------------------------

/**
 * Get the top discounted games across all stores or for a specific store.
 * Maps to: GET /api/ranking/top
 */
export async function getRanking(store?: string, limit?: number): Promise<RankingResponse> {
  const params = new URLSearchParams();
  if (store) params.append('store', store);
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString();
  return apiFetch<RankingResponse>(`/api/ranking/top${query ? `?${query}` : ''}`);
}
