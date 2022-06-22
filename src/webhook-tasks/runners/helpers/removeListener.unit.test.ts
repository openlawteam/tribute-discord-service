import {removeListener} from './removeListener';
import {snapshotEventEmitter} from '../../../singletons/eventEmitters/snapshotEventEmitter';

describe('removeListener unit tests', () => {
  test('should unsubscribe from listener', () => {
    const listenerSpy = jest.fn();

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    // Register listener
    snapshotEventEmitter?.on('proposalCreated', listenerSpy);

    // Unsubscribe
    removeListener({
      eventEmitter: snapshotEventEmitter,
      listener: listenerSpy,
      name: 'proposalCreated',
    });

    // Assert information logged

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      'Removed `proposalCreated` event listener: `mockConstructor`.'
    );

    // Assert no listener for `proposalCreated`; only the default `error` listener is registered
    expect(snapshotEventEmitter.eventNames()).toEqual(['error']);
  });
});
