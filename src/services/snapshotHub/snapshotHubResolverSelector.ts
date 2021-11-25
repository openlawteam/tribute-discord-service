import {
  legacyTributeDraftResolver,
  legacyTributeProposalResolver,
  SnapshotHubProposalBase,
  SnapshotHubProposalResolverArgs,
} from '.';

export async function snapshotHubResolverSelector<R = any>(
  args: SnapshotHubProposalResolverArgs
): Promise<SnapshotHubProposalBase<R> | undefined> {
  switch (args.resolver) {
    case 'LEGACY_TRIBUTE':
      return await legacyTributeProposalResolver<R>(args);

    case 'LEGACY_TRIBUTE_DRAFT':
      return await legacyTributeDraftResolver<R>(args);

    default:
      return await legacyTributeProposalResolver<R>(args);
  }
}
