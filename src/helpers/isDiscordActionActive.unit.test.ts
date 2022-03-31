import {isDiscordActionActive} from '.';

describe('isDiscordActionActive unit tests', () => {
  test('should return `true`', () => {
    expect(
      isDiscordActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
      })
    ).toBe(true);

    expect(
      isDiscordActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: true,
      })
    ).toBe(true);

    expect(
      isDiscordActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: undefined,
      })
    ).toBe(true);
  });

  test('should return `false`', () => {
    expect(isDiscordActionActive(undefined)).toBe(false);

    expect(
      isDiscordActionActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: false,
      })
    ).toBe(false);
  });
});
