import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone,
  validPhone,
  validBody,
  isDirection,
  isMessageStatus,
  extractInbound,
  extractStatuses,
  mapProviderStatus,
  preview,
} from '../lib/whatsapp/inbox';

describe('normalizePhone', () => {
  it('converts Nigerian 0-prefixed numbers to 234', () => {
    assert.equal(normalizePhone('08109522432'), '2348109522432');
    assert.equal(normalizePhone('+234 803 123 4567'), '2348031234567');
  });
  it('keeps already-coded numbers and strips noise', () => {
    assert.equal(normalizePhone('2348109522432'), '2348109522432');
    assert.equal(normalizePhone('(080) 3317-0802'), '2348033170802');
  });
  it('handles garbage safely', () => {
    assert.equal(normalizePhone(''), '');
    assert.equal(normalizePhone(null), '');
    assert.equal(normalizePhone(undefined), '');
  });
});

describe('validators', () => {
  it('accepts E.164-range digit strings', () => {
    assert.equal(validPhone('2348109522432'), true);
    assert.equal(validPhone('12345'), false);
    assert.equal(validPhone('abc'), false);
  });
  it('body must be 1..4096 chars', () => {
    assert.equal(validBody('hello'), true);
    assert.equal(validBody('  '), false);
    assert.equal(validBody('x'.repeat(4097)), false);
    assert.equal(validBody(42), false);
  });
  it('direction and status guards', () => {
    assert.equal(isDirection('inbound'), true);
    assert.equal(isDirection('sideways'), false);
    assert.equal(isMessageStatus('delivered'), true);
    assert.equal(isMessageStatus('teleported'), false);
  });
});

describe('extractInbound', () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: 'PN123' },
              messages: [
                { from: '08109522432', id: 'wamid.1', timestamp: '1758750000', text: { body: 'Do you have 100HP?' } },
              ],
            },
          },
        ],
      },
    ],
  };
  it('parses a Meta text message', () => {
    const m = extractInbound(payload);
    assert.ok(m);
    assert.equal(m?.from, '2348109522432');
    assert.equal(m?.text, 'Do you have 100HP?');
    assert.equal(m?.phoneNumberId, 'PN123');
    assert.equal(m?.providerId, 'wamid.1');
  });
  it('rejects non-text and malformed payloads', () => {
    assert.equal(extractInbound(null), null);
    assert.equal(extractInbound({}), null);
    assert.equal(extractInbound({ entry: [{ changes: [{ value: { messages: [{ from: 'x' }] } }] }] }), null);
  });
});

describe('extractStatuses + mapProviderStatus', () => {
  it('pulls delivery updates', () => {
    const out = extractStatuses({
      entry: [{ changes: [{ value: { statuses: [{ id: 'wamid.1', status: 'delivered' }] } }] }],
    });
    assert.deepEqual(out, [{ providerId: 'wamid.1', status: 'delivered' }]);
  });
  it('maps known statuses, ignores the rest', () => {
    assert.equal(mapProviderStatus('delivered'), 'delivered');
    assert.equal(mapProviderStatus('read'), 'read');
    assert.equal(mapProviderStatus('failed'), 'failed');
    assert.equal(mapProviderStatus('sent'), 'sent');
    assert.equal(mapProviderStatus('weird'), null);
  });
});

describe('preview', () => {
  it('flattens and truncates', () => {
    assert.equal(preview('  hi\nthere  '), 'hi there');
    assert.equal(preview('x'.repeat(200), 10), `${'x'.repeat(10)}…`);
  });
});
