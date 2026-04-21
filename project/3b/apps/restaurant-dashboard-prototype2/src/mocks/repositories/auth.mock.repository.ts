import type { AuthRepository } from "@/services/repositories/auth.repository";
import { AUTH_MOCK_CREDENTIALS, AUTH_MOCK_DELAY_MS, AUTH_MOCK_RESPONSE } from "@/mocks/data/auth.mock";

function delay(ms: number) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export const authMockRepository: AuthRepository = {
  async loginRestaurant(payload) {
    await delay(AUTH_MOCK_DELAY_MS);

    if (payload.email !== AUTH_MOCK_CREDENTIALS.email || payload.password !== AUTH_MOCK_CREDENTIALS.password) {
      throw new Error("Credenciales inválidas. Usa rest@test.com y 123456.");
    }

    return AUTH_MOCK_RESPONSE;
  },
};
