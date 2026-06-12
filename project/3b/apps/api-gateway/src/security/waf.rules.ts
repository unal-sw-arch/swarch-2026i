export type WafRule = Readonly<{
  id: string;
  name: string;
  pattern: RegExp;
  statusCode: number;
}>;

export type WafInspectionInput = Readonly<{
  path: string;
  query: string;
  body: string;
  contentLength?: number;
  maxBodyBytes: number;
}>;

export type WafInspectionResult = Readonly<{
  allowed: boolean;
  rule?: WafRule;
  matchedOn?: 'path' | 'query' | 'body' | 'size';
}>;

export const wafRules: readonly WafRule[] = [
  {
    id: 'SQL_INJECTION',
    name: 'SQL Injection',
    statusCode: 403,
    pattern:
      /\b(select|insert|update|delete|drop|union|exec|execute|cast|convert|information_schema)\b|--|;\s*(drop|delete|insert|update)\b|'\s*or\s*'?1'?='?1|\bor\b\s+\d+\s*=\s*\d+/i,
  },
  {
    id: 'CROSS_SITE_SCRIPTING',
    name: 'Cross-Site Scripting (XSS)',
    statusCode: 403,
    pattern: /<\s*script\b|javascript\s*:|on\w+\s*=|<\s*iframe\b|<\s*img\b[^>]*\bonerror\s*=/i,
  },
  {
    id: 'PATH_TRAVERSAL',
    name: 'Path Traversal',
    statusCode: 403,
    pattern: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|%252e%252e%252f/i,
  },
];

const inspectValue = (value: string): WafRule | undefined => wafRules.find((rule) => rule.pattern.test(value));

export const inspectRequest = (input: WafInspectionInput): WafInspectionResult => {
  const bodyBytes = Buffer.byteLength(input.body, 'utf8');

  if (
    (input.contentLength !== undefined && input.contentLength > input.maxBodyBytes) ||
    bodyBytes > input.maxBodyBytes
  ) {
    return {
      allowed: false,
      matchedOn: 'size',
      rule: {
        id: 'PAYLOAD_TOO_LARGE',
        name: 'Payload Size Limit',
        statusCode: 413,
        pattern: /.*/,
      },
    };
  }

  const checks: ReadonlyArray<readonly ['path' | 'query' | 'body', string]> = [
    ['path', input.path],
    ['query', input.query],
    ['body', input.body],
  ];

  for (const [matchedOn, value] of checks) {
    const rule = inspectValue(value);

    if (rule) {
      return {
        allowed: false,
        matchedOn,
        rule,
      };
    }
  }

  return { allowed: true };
};
