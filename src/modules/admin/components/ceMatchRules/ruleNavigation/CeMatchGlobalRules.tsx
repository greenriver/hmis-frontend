import CeMatchEffectiveRulesCard from '../ruleGroups/CeMatchEffectiveRulesCard';
import CeMatchRuleGroupSection from '../ruleGroups/CeMatchRuleGroupSection';
import Loading from '@/components/elements/Loading';
import { GlobalIcon } from '@/components/elements/SemanticIcons';
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
      <CeMatchRuleGroupSection
        ownerLevel='global'
        icon={<GlobalIcon color='primary' fontSize='small' />}
        rules={rules}
        count={count}
        variant='current'
      />
    </CeMatchEffectiveRulesCard>
  );
};

export default CeMatchGlobalRules;
