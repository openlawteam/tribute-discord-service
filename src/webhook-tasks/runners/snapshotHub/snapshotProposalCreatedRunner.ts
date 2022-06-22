import {
  legacyTributeDraftCreatedAction,
  legacyTributeGovernanceProposalCreatedAction,
} from '../../actions/snapshotHub';
import {Daos} from '../../../config';
import {removeListener} from '../helpers';
import {runAll} from '../../../helpers';
import {RunnerReturn} from '../types';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';

const {eventEmitter, name} = SNAPSHOT_PROPOSAL_CREATED_EVENT;

export function snapshotProposalCreatedRunner(
  daos: Daos | undefined
): RunnerReturn {
  const proposalCreatedActions = runAll([
    legacyTributeDraftCreatedAction(SNAPSHOT_PROPOSAL_CREATED_EVENT, daos),
    legacyTributeGovernanceProposalCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      daos
    ),
  ]);

  eventEmitter?.on('proposalCreated', proposalCreatedActions);

  const stop = async () => {
    removeListener({
      eventEmitter,
      listener: proposalCreatedActions,
      name: 'proposalCreated',
    });
  };

  return {
    eventEmitter,
    eventName: name,
    stop,
  };
}
