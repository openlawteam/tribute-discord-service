import EventEmitter from 'events';

import {tributeToolsEventEmitter} from './tributeToolsEventEmitter';

describe('tributeToolsEventEmitter unit tests', () => {
  test('should provide `EventEmitter` instance', () => {
    expect(tributeToolsEventEmitter).toBeInstanceOf(EventEmitter);
  });

  test('should handle `error` event', () => {
    const ERROR: Error = new Error('Some bad error.');

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((e) => e);

    tributeToolsEventEmitter.emit('error', ERROR);

    // Assert the emitter has registered the `error` event has a registered listener
    expect(tributeToolsEventEmitter.eventNames()).toEqual(['error']);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      `An \`error\` event was emitted on \`tributeToolsEventEmitter\`: ${ERROR}`
    );

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
