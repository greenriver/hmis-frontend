import CeMatchOwnerRulesCurrentLevel from './CeMatchOwnerRulesCurrentLevel';
import CeMatchOwnerRuleSummary from './CeMatchOwnerRuleSummary';
import Loading from '@/components/elements/Loading';
import { GlobalIcon } from '@/components/elements/SemanticIcons';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useGetCeMatchGlobalRulesQuery } from '@/types/gqlTypes';

const CeMatchGlobalRulesCard: React.FC = () => {
  const { data, loading, error } = useGetCeMatchGlobalRulesQuery({
    fetchPolicy: 'cache-and-network',
  });

  if (error) return <ApolloErrorAlert error={error} />;
  if (!data && loading) return <Loading />;

  const rules = data?.ceMatchRules.nodes || [];
  const count = data?.ceMatchRules.nodesCount || 0;

  return (
    <CeMatchOwnerRuleSummary
      ownerName='Global'
      effectiveRulesCount={count}
      ruleCountSummaries={[{ label: 'Global', count }]}
    >
      <CeMatchOwnerRulesCurrentLevel
        ownerLevel='global'
        icon={<GlobalIcon color='primary' fontSize='small' />}
        rules={rules}
        count={count}
      />
    </CeMatchOwnerRuleSummary>
  );
};

export default CeMatchGlobalRulesCard;
