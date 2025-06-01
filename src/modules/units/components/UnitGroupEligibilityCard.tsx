import CommonCard from '@/components/elements/CommonCard';
import MatchRuleDisplay from '@/modules/ce/components/MatchRuleDisplay';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupDetailFieldsFragment;
  canEdit: boolean;
}

// This component displays the eligibility requirements for a unit group
// TODO(#7544): add the ability to edit eligibility requirements

const UnitGroupEligibilityCard: React.FC<Props> = ({ unitGroup }) => {
  return (
    <CommonCard title='Eligibility Requirements'>
      {unitGroup.eligibilityRequirements && (
        <MatchRuleDisplay rules={unitGroup.eligibilityRequirements} />
      )}
    </CommonCard>
  );
};

export default UnitGroupEligibilityCard;
