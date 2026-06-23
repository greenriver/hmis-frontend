import { ceMatchRuleOwnerLevelConfigs } from '../ceMatchRuleOwnerLevelConfig';
import CeMatchEffectiveRulesCard from '../ruleGroups/CeMatchEffectiveRulesCard';
import CeMatchRuleGroupSection from '../ruleGroups/CeMatchRuleGroupSection';
import Loading from '@/components/elements/Loading';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useGetCeMatchGlobalRulesQuery } from '@/types/gqlTypes';

const CeMatchGlobalRules: React.FC = () => {
  const { data, loading, error } = useGetCeMatchGlobalRulesQuery({
    fetchPolicy: 'cache-and-network',
  });
  const { label } = ceMatchRuleOwnerLevelConfigs.global;

  if (error) return <ApolloErrorAlert error={error} />;
  if (!data && loading) return <Loading />;

  const rules = data?.ceMatchRules.nodes || [];
  const count = data?.ceMatchRules.nodesCount || 0;

  return (
    <CeMatchEffectiveRulesCard
      ownerName={label}
      effectiveRulesCount={count}
      ruleCountSummaries={[{ label, count }]}
    >
      <CeMatchRuleGroupSection
        ownerLevel='global'
        rules={rules}
        count={count}
        variant='current'
      />
    </CeMatchEffectiveRulesCard>
  );
};

export default CeMatchGlobalRules;
