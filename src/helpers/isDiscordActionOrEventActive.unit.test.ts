import {isDiscordActionOrEventActive} from '.';

describe('isDiscordActionOrEventActive unit tests', () => {
  test('should return `true` for actions', () => {
    expect(
      isDiscordActionOrEventActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
      })
    ).toBe(true);

    expect(
      isDiscordActionOrEventActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: true,
      })
    ).toBe(true);

    expect(
      isDiscordActionOrEventActive({
        name: 'SPONSORED_PROPOSAL_WEBHOOK',
        webhookID: 'abc123',
        active: undefined,
      })
    ).toBe(true);
  });

  test('should return `true` for events', () => {
    expect(
      isDiscordActionOrEventActive({
        name: 'SNAPSHOT_PROPOSAL_END',
      })
    ).toBe(true);

    expect(
      isDiscordActionOrEventActive({
        name: 'SNAPSHOT_PROPOSAL_END',
        active: true,
      })
    ).toBe(true);

    expect(
      isDiscordActionOrEventActive({
        name: 'SNAPSHOT_PROPOSAL_END',
        active: undefined,
      })
    ).toBe(true);
  });

  test('should return `false` for if `undefined` is passed', () => {
    expect(isDiscordActionOrEventActive(undefined)).toBe(false);

    expect(
      isDiscordActionOrEventActive({
        name: 'SNAPSHOT_PROPOSAL_END',
        active: false,
      })
    ).toBe(false);
  });
});
