import {runAll} from './runAll';

describe('runAll unit tests', () => {
  test('should run all functions', () => {
    const spyFunctionOne = jest.fn();
    const spyFunctionTwo = jest.fn();
    const spyFunctionThree = jest.fn();

    const testArgs = [
      123,
      'test',
      {
        so: 'cool',
      },
    ];

    // Run with arguments passed
    runAll([spyFunctionOne, spyFunctionTwo, spyFunctionThree])(...testArgs);

    expect(spyFunctionOne.mock.calls.length).toBe(1);
    expect(spyFunctionOne.mock.calls[0][0]).toBe(testArgs[0]);
    expect(spyFunctionOne.mock.calls[0][1]).toBe(testArgs[1]);
    expect(spyFunctionOne.mock.calls[0][2]).toEqual(testArgs[2]);

    expect(spyFunctionTwo.mock.calls.length).toBe(1);
    expect(spyFunctionTwo.mock.calls[0][0]).toBe(testArgs[0]);
    expect(spyFunctionTwo.mock.calls[0][1]).toBe(testArgs[1]);
    expect(spyFunctionTwo.mock.calls[0][2]).toEqual(testArgs[2]);

    expect(spyFunctionThree.mock.calls.length).toBe(1);
    expect(spyFunctionThree.mock.calls[0][0]).toBe(testArgs[0]);
    expect(spyFunctionThree.mock.calls[0][1]).toBe(testArgs[1]);
    expect(spyFunctionThree.mock.calls[0][2]).toEqual(testArgs[2]);
  });

  test('should not exit loop if a function throws', () => {
    const spyFunctionOne = jest.fn();
    const spyFunctionThree = jest.fn();

    const spyFunctionTwo = jest.fn(() => {
      throw new Error('So bad!');
    });

    const testArgs = [
      123,
      'test',
      {
        so: 'cool',
      },
    ];

    // Run with arguments passed; logging off
    runAll(
      [spyFunctionOne, spyFunctionTwo, spyFunctionThree],
      false
    )(...testArgs);

    expect(spyFunctionOne.mock.calls.length).toBe(1);
    expect(spyFunctionOne.mock.calls[0][0]).toBe(testArgs[0]);
    expect(spyFunctionOne.mock.calls[0][1]).toBe(testArgs[1]);
    expect(spyFunctionOne.mock.calls[0][2]).toEqual(testArgs[2]);

    expect(spyFunctionTwo.mock.calls.length).toBe(1);
    expect(spyFunctionTwo.mock.calls[0]).toEqual(testArgs);

    expect(spyFunctionThree.mock.calls.length).toBe(1);
    expect(spyFunctionThree.mock.calls[0][0]).toBe(testArgs[0]);
    expect(spyFunctionThree.mock.calls[0][1]).toBe(testArgs[1]);
    expect(spyFunctionThree.mock.calls[0][2]).toEqual(testArgs[2]);
  });
});
