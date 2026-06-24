import CeMatchEffectiveRulesCard from '../ruleGroups/CeMatchEffectiveRulesCard';
import CeMatchRuleGroup from '../ruleGroups/CeMatchRuleGroup';
import Loading from '@/components/elements/Loading';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useGetCeMatchGlobalRulesQuery } from '@/types/gqlTypes';

const CeMatchGlobalRules: React.FC = () => {
  const { data, loading, error } = useGetCeMatchGlobalRulesQuery({
    fetchPolicy: 'cache-and-network',
  });

  if (error) return <ApolloErrorAlert error={error} />;
  if (!data && loading) return <Loading />;

  const rules = data?.ceMatchRules.nodes || [];
  const count = data?.ceMatchRules.nodesCount || 0;

  return (
    <CeMatchEffectiveRulesCard
      ownerName='Global'
      effectiveRulesCount={count}
      ruleCountSummaries={[{ label: 'Global', count }]}
    >
      <CeMatchRuleGroup ownerLevel='global' rules={rules} count={count} />
    </CeMatchEffectiveRulesCard>
  );
};

export default CeMatchGlobalRules;
