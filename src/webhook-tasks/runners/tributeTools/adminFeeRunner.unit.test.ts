import {adminFeeRunner} from './adminFeeRunner';
import {tributeToolsEventEmitter} from '../../../singletons/eventEmitters';
import {TributeToolsFeeWebhookPayload} from '../../../http-api/middleware/tributeTools/tributeToolsFeeWebhook';

describe('adminFeeRunner unit tests', () => {
  const PAYLOAD: TributeToolsFeeWebhookPayload = {
    amount: '10000000000000000',
    daoName: 'tribute',
    description: 'An admin fee is due',
    totalContribution: '10000000000000000',
  };

  /**
   * We test the lifecycle in a single test as it's easiest.
   * If we add multiple tests and assert the registered listeners
   * we cannot accurately receive a count as we are using the `tributeToolsEventEmitter` singleton
   * and Jest runs tests async.
   */
  test('should execute `adminFee` runner lifeycle', async () => {
    const notifyAdminFeeSpy = jest
      .spyOn(
        await import('../../actions/tributeTools/notifyAdminFee'),
        'notifyAdminFee'
      )
      .mockImplementation(async () => {});

    // Assert default `error` listener
    expect(tributeToolsEventEmitter.eventNames()).toEqual(['error']);

    const runner = adminFeeRunner(undefined);

    tributeToolsEventEmitter.emit('adminFee', PAYLOAD);

    // Assert `adminFee` listener registered
    expect(tributeToolsEventEmitter.eventNames()).toEqual([
      'error',
      'adminFee',
    ]);

    expect(notifyAdminFeeSpy).toHaveBeenCalledTimes(1);
    expect(notifyAdminFeeSpy).toHaveBeenNthCalledWith(1, PAYLOAD);

    await runner.stop?.();

    // Assert `adminFee` listener was removed and only the default `error` listener is registered
    expect(tributeToolsEventEmitter.eventNames()).toEqual(['error']);

    // Cleanup
    notifyAdminFeeSpy.mockRestore();
  });
});
