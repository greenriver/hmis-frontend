import { Typography } from '@mui/material';
import CommonCard from '@/components/elements/CommonCard';
import EditIconButton from '@/components/elements/EditIconButton';
import MatchRuleDisplay from '@/modules/ce/components/MatchRuleDisplay';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupDetailFieldsFragment;
  canEdit?: boolean;
}

// This component displays the eligibility requirements for a unit group

const UnitGroupEligibilityCard: React.FC<Props> = ({
  unitGroup,
  canEdit = false,
}) => {
  const eligibilityRequirements = unitGroup.eligibilityRequirements || [];

  return (
    <CommonCard
      title='Eligibility Requirements'
      actions={canEdit && <EditIconButton title='Edit Eligibility' />}
    >
      {eligibilityRequirements.length > 0 && (
        <MatchRuleDisplay rules={eligibilityRequirements} />
      )}
      {eligibilityRequirements.length === 0 && (
        <Typography>No eligibility requirements.</Typography>
      )}
    </CommonCard>
  );
};

export default UnitGroupEligibilityCard;
