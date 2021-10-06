import {isDaoActionActive} from '.';

describe('isDaoActionActive unit tests', () => {
  test('should return `true`', () => {
    expect(
      isDaoActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
      })
    ).toBe(true);

    expect(
      isDaoActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: true,
      })
    ).toBe(true);

    expect(
      isDaoActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: undefined,
      })
    ).toBe(true);
  });

  test('should return `false`', () => {
    expect(isDaoActionActive(undefined)).toBe(false);

    expect(
      isDaoActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: false,
      })
    ).toBe(false);
  });
});
