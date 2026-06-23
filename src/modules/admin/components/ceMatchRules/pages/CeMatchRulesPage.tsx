import { CeMatchRuleOwnerLevel } from '../editor/ceMatchRuleFormUtil';
import CeMatchRulesTabs from '../ruleNavigation/CeMatchRulesTabs';
import PageTitle from '@/components/layout/PageTitle';

const CeMatchRulesPage: React.FC<{ ownerLevel: CeMatchRuleOwnerLevel }> = ({
  ownerLevel,
}) => (
  <>
    <PageTitle overlineText='Coordinated Entry' title='Rules' />
    <CeMatchRulesTabs selectedOwnerLevel={ownerLevel} />
  </>
);

export default CeMatchRulesPage;
