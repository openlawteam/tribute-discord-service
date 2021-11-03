import {subscribeUnsubscribeHandler} from './subscribeUnsubscribeHandler';

describe('subscribeUnsubscribeHandler unit tests', () => {
  test('should call `Subscription.unsubscribe`', async () => {
    const spy = jest.fn();
    const FAKE_SUBSCRIPTION: any = {unsubscribe: spy};

    await subscribeUnsubscribeHandler(FAKE_SUBSCRIPTION, {
      name: 'SPONSORED_PROPOSAL',
    });

    // Assert unsubscription called
    expect(spy.mock.calls.length).toBe(1);
  });
});
