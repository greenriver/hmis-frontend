import { describe, expect, it } from 'vitest';

import { nextSessionTracking } from './useSessionTrackingObserver';
import { sessionExpiresAt } from '@/modules/auth/api/storage';

describe('nextSessionTracking', () => {
  const now = 1000;

  it('stamps the response time when no remaining seconds are reported (Devise)', () => {
    const tracking = nextSessionTracking({ userId: '1' }, undefined, now);

    expect(tracking).toEqual({ userId: '1', timestamp: now });
    expect(sessionExpiresAt(tracking!, 1800)).toBe(now + 1800);
  });

  it('anchors the token expiry to the request start, not the response (JWT)', () => {
    const tracking = nextSessionTracking(
      { userId: '1', remainingSecs: 1500, requestedAt: now - 20 },
      undefined,
      now
    );

    expect(sessionExpiresAt(tracking!, 1800)).toBe(now - 20 + 1500);
  });

  it('drops a response from a request older than the stored one', () => {
    const stored = {
      userId: '1',
      timestamp: now,
      requestedAt: now - 5,
      expiresAt: now + 1795,
    };

    expect(
      nextSessionTracking(
        { userId: '1', remainingSecs: 1600, requestedAt: now - 10 },
        stored,
        now
      )
    ).toBeUndefined();
  });

  it('lets a newer request pull the expiry earlier, as a failed refresh does', () => {
    const stored = {
      userId: '1',
      timestamp: now,
      requestedAt: now - 10,
      expiresAt: now + 1790,
    };
    const tracking = nextSessionTracking(
      { userId: '1', remainingSecs: 200, requestedAt: now - 5 },
      stored,
      now
    );

    expect(tracking?.expiresAt).toBe(now + 195);
  });

  it('accepts an older request for a different user', () => {
    const stored = {
      userId: '1',
      timestamp: now,
      requestedAt: now,
      expiresAt: now + 1800,
    };
    const tracking = nextSessionTracking(
      { userId: '2', remainingSecs: 1800, requestedAt: now - 5 },
      stored,
      now
    );

    expect(tracking?.userId).toBe('2');
  });
});
