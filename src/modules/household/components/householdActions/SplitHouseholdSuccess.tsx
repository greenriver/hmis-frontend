import React from 'react';
import {
  clientBriefName,
  findHohOrRep,
  stringifyHousehold,
} from '@/modules/hmis/hmisUtil';
import SuccessWayfindingStep from '@/modules/household/components/householdActions/SuccessWayfindingStep';
import {
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  splitHousehold: HouseholdFieldsFragment;
  donorHousehold: HouseholdFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
  onClose: VoidFunction;
}

const SplitHouseholdSuccess = ({
  splitHousehold,
  donorHousehold,
  project,
  onClose,
}: Props) => {
  const donorHoh = findHohOrRep(donorHousehold.householdClients);
  const donorHohName = clientBriefName(donorHoh.client);
  const splitHoh = findHohOrRep(splitHousehold.householdClients);

  return (
    <SuccessWayfindingStep
      title={'Successful Join'}
      description={`${stringifyHousehold(splitHousehold.householdClients)} ${splitHousehold.householdClients.length > 1 ? 'have' : 'has'} been successfully split from ${donorHohName}’s Enrollment at ${project.projectName}`}
      primaryClientName={donorHohName}
      secondary={splitHoh}
      project={project}
      onClose={onClose}
    />
  );
};

export default SplitHouseholdSuccess;
