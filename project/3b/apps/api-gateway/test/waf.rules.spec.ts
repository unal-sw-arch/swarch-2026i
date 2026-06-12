import assert from 'node:assert/strict';
import { inspectRequest } from '../src/security/waf.rules';

const baseInput = {
  path: '/api/catalog/restaurants',
  query: '',
  body: '',
  maxBodyBytes: 1024,
};

assert.equal(inspectRequest(baseInput).allowed, true);

assert.equal(
  inspectRequest({
    ...baseInput,
    query: "email=test%40deliunal.com&search=' OR 1=1 --",
  }).rule?.id,
  'SQL_INJECTION',
);

assert.equal(
  inspectRequest({
    ...baseInput,
    query: "email=test%40deliunal.com&search=' OR 1=1 --",
  }).matchedOn,
  'query',
);

assert.equal(
  inspectRequest({
    ...baseInput,
    body: '{"name":"<script>alert(1)</script>"}',
  }).rule?.id,
  'CROSS_SITE_SCRIPTING',
);

assert.equal(
  inspectRequest({
    ...baseInput,
    path: '/api/../../etc/passwd',
  }).rule?.id,
  'PATH_TRAVERSAL',
);

assert.equal(
  inspectRequest({
    ...baseInput,
    contentLength: 2048,
  }).rule?.id,
  'PAYLOAD_TOO_LARGE',
);
