import { AppError } from '../../app/errors/app-error';
import { GatewayErrorCode } from '../../app/errors/error-codes';
import { logger } from '../utils/logger';

/**
 * Circuit Breaker (Reliability tactic — fault tolerance).
 *
 * Estados:
 *  - CLOSED:    el tráfico fluye normal; se cuentan fallos consecutivos.
 *  - OPEN:      tras superar el umbral de fallos, se "abre" y rechaza rápido
 *               (fail-fast) sin golpear al servicio caído, evitando cascada.
 *  - HALF_OPEN: pasado el tiempo de reset, se deja pasar una prueba; si tiene
 *               éxito vuelve a CLOSED, si falla vuelve a OPEN.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Nombre del recurso protegido (para logs/observabilidad). */
  readonly name: string;
  /** Fallos consecutivos que abren el circuito. */
  readonly failureThreshold: number;
  /** Tiempo (ms) que el circuito permanece OPEN antes de probar de nuevo. */
  readonly resetTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private nextAttemptAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  public getState(): CircuitState {
    return this.state;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptAt) {
        throw this.openCircuitError();
      }
      // Tiempo de reset cumplido: pasamos a probar con una petición.
      this.transitionTo('HALF_OPEN');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    if (this.state !== 'CLOSED') {
      this.transitionTo('CLOSED');
    }
  }

  private onFailure(): void {
    this.consecutiveFailures += 1;

    if (this.state === 'HALF_OPEN') {
      this.open();
      return;
    }

    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.nextAttemptAt = Date.now() + this.options.resetTimeoutMs;
    this.transitionTo('OPEN');
  }

  private transitionTo(state: CircuitState): void {
    if (this.state === state) {
      return;
    }
    this.state = state;
    logger.warn('circuit-breaker.state-change', {
      breaker: this.options.name,
      state,
      consecutiveFailures: this.consecutiveFailures,
    });
  }

  private openCircuitError(): AppError {
    return new AppError(
      GatewayErrorCode.UPSTREAM_UNAVAILABLE,
      `Circuit open for ${this.options.name}`,
      503,
      { breaker: this.options.name, state: this.state },
    );
  }
}
