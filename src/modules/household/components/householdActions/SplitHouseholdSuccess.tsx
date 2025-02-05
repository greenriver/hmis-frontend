import React from 'react';
import {
  clientBriefName,
  findHohOrRep,
  stringifyHousehold,
} from '@/modules/hmis/hmisUtil';
import SuccessWayfindingStep from '@/modules/household/components/householdActions/SuccessWayfindingStep';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  splitHousehold?: HouseholdFieldsFragment;
  donorHousehold?: HouseholdFieldsFragment;
  initiator: HouseholdClientFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
  onClose: VoidFunction;
}

const SplitHouseholdSuccess = ({
  splitHousehold,
  donorHousehold,
  initiator,
  project,
  onClose,
}: Props) => {
  if (!splitHousehold || !donorHousehold) {
    // This is unexpected; if we get here, the split mutation succeeded, but didn't return the expected info.
    // Throw so that we get alerted.
    throw new Error(
      `Something went wrong with splitting ${initiator.id} out of project ${project.id}`
    );
  }

  const donorHoh = findHohOrRep(donorHousehold.householdClients);
  const donorHohName = clientBriefName(donorHoh.client);
  const splitHoh = findHohOrRep(splitHousehold.householdClients);

  return (
    <SuccessWayfindingStep
      title={'Successful Split'}
      description={`${stringifyHousehold(splitHousehold.householdClients)} ${splitHousehold.householdClients.length > 1 ? 'have' : 'has'} been successfully split from ${donorHohName}’s Enrollment at ${project.projectName}`}
      primaryClientName={donorHohName}
      secondary={splitHoh}
      project={project}
      onClose={onClose}
    />
  );
};

export default SplitHouseholdSuccess;
