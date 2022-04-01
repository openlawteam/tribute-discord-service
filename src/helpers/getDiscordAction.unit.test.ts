import {FAKE_DAOS_FIXTURE} from '../../test/fixtures';
import {getDiscordAction} from './getDiscordAction';

describe('getDiscordAction unit tests', () => {
  test('should return a discord action', () => {
    expect(
      getDiscordAction('SPONSORED_PROPOSAL_WEBHOOK', FAKE_DAOS_FIXTURE.test)
    ).toEqual({
      name: 'SPONSORED_PROPOSAL_WEBHOOK',
      webhookID: '886976872611729439',
    });
  });

  test('should return `undefined` if could not find a discord action', () => {
    expect(
      getDiscordAction(
        'TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK',
        FAKE_DAOS_FIXTURE.test
      )
    ).toBe(undefined);
  });

  test('should return `undefined` if could not find a discord action for `undefined` dao', () => {
    expect(getDiscordAction('TRIBUTE_TOOLS_ADMIN_FEE_WEBHOOK', undefined)).toBe(
      undefined
    );
  });
});
