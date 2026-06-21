# Throttling Pattern — GameSeeker Gateway

**Quality Attribute:** Performance & Scalability  
**Tactic:** Manage Work Requests (Control Resource Demand)

## Overview

GameSeeker applies the **Throttling** pattern at the API Gateway. The gateway
acts as the throttler for the game search endpoint, limiting how many requests a
single client can send before the request is forwarded to the scrapper tier.

The protected flow is:

```text
Client / JMeter / Frontend
        |
        v
gateway-service
  - rateLimiter middleware
  - Redis sliding window state
        |
        v
scrapper-lb
        |
        v
scrapper-service replicas
```

The current implementation protects:

```text
GET /api/games/search?name=<game>
```

with a limit of **10 requests per minute per client IP**. Requests over the
threshold receive `HTTP 429 Too Many Requests` and are not forwarded to the
scrapper service.

## Implementation

The throttling logic is implemented in:

```text
gateway-service/src/middleware/rateLimiter.ts
```

The middleware uses a Redis sorted set per client:

```text
ratelimit:search:<ip>
```

Each request is inserted with the current timestamp as score. Before counting
requests, entries older than the 60-second window are removed. If the remaining
number of requests is greater than 10, the gateway rejects the request with
`429`.

The middleware is applied in:

```text
gateway-service/src/routes/games.ts
```

```ts
games.use("/search", rateLimiter);
```

## Quality Scenario

| Element | Description |
|---|---|
| Source | Concurrent users or an automated load-testing client such as Apache JMeter. |
| Stimulus | Bursts of requests to `GET /api/games/search?name=Cyberpunk`. |
| Artifact | `gateway-service`, its `rateLimiter` middleware, Redis, and the downstream scrapper tier. |
| Environment | Normal operation under increasing concurrent load. |
| Response | The gateway allows requests within the quota and rejects excess requests before they reach the scrapper tier. |
| Response Measure | Up to 10 requests per client IP per minute are forwarded; excess requests return `429` with `Retry-After` and `X-RateLimit-*` headers. |

## JMeter Test Plan

A JMeter plan for this pattern is provided at:

```text
jmeter/gameseeker-throttling-loadtest.jmx
```

Target endpoint:

```text
GET http://localhost:8080/api/games/search?name=Cyberpunk
```

Run the same plan with the following thread counts and a 1-second ramp-up:

| Test | Threads | Ramp-up |
|---|---:|---:|
| Baseline | 1 | 1s |
| Low load | 50 | 1s |
| Medium load | 200 | 1s |
| High load | 500 | 1s |

For this pattern, `429` responses are expected once the quota is exceeded. In
the final report, separate system failures from controlled throttling responses:

- `200`: request passed through the throttler and reached the scrapper tier.
- `429`: expected throttling response when the client exceeds its quota.
- `5xx`: actual system failure and should be analyzed separately.

## Recommendations

1. Keep the throttling state in Redis or another shared store when multiple
   gateway instances are deployed. In-memory counters would break under
   horizontal scaling.
2. Document the rate-limit granularity explicitly. GameSeeker currently limits
   per IP, which is appropriate for public search traffic; authenticated flows
   could additionally limit per user.
3. Do not use throttled endpoints to evaluate a load balancer in isolation unless
   the rate limit is temporarily relaxed. Otherwise, the throttling layer will
   dominate the load-test results.
