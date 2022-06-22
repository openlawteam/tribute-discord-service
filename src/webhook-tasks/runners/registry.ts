/**
 * Runner Registry
 *
 * Export any individual runners which will be automatically
 * started (via `startWebhookTasks`) when the app is run.
 *
 * Comment-out, or remove, any individual runners not to be automatically run.
 * Some runners rely on listening to external events (e.g. Ethereum logs),
 * so they are good cases for when a runner should be automatically started.
 *
 * Runners should meet the signature of one of the following:
 *  - `(daos: Daos | undefined) => RunnerReturn`
 *  - `(daos: Daos | undefined) => Promise<RunnerReturn>`
 *
 */

export {adminFeeRunner} from './tributeTools';
export {snapshotProposalCreatedRunner} from './snapshotHub';
export {sponsoredProposalRunnerSubscribeLogs} from './web3/subscribeLogs';
