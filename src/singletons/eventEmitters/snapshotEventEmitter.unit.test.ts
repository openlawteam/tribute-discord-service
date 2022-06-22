import EventEmitter from 'events';

import {snapshotEventEmitter} from './snapshotEventEmitter';

describe('snapshotEventEmitter unit tests', () => {
  test('should provide `EventEmitter` instance', () => {
    expect(snapshotEventEmitter).toBeInstanceOf(EventEmitter);
  });

  test('should handle `error` event', () => {
    const ERROR: Error = new Error('Some bad error.');

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    snapshotEventEmitter.emit('error', ERROR);

    // Assert the emitter has registered the `error` event has a registered listener
    expect(snapshotEventEmitter.eventNames()).toEqual(['error']);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      `An \`error\` event was emitted on \`snapshotEventEmitter\`: ${ERROR}`
    );

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
