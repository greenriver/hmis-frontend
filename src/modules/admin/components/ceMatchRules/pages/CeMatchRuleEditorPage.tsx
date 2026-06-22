import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import CeMatchRuleForm from '../editor/CeMatchRuleForm';
import { ceMatchRuleOwnerTypeByRouteParam } from '../editor/ceMatchRuleFormUtil';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';

const CeMatchRuleEditorPage = () => {
  const navigate = useNavigate();

  const { ownerLevel } = useSafeParams<{ ownerLevel: string }>();
  const ownerType =
    ownerLevel && ownerLevel in ceMatchRuleOwnerTypeByRouteParam
      ? ceMatchRuleOwnerTypeByRouteParam[
          ownerLevel as keyof typeof ceMatchRuleOwnerTypeByRouteParam
        ]
      : undefined;

  const returnToRulesOverview = useCallback(() => {
    if (!ownerType) return;
    // TODO(#7544): return to correct page depending on ownerType
    navigate(generatePath(AdminDashboardRoutes.ELIGIBILITY_RULES));
  }, [navigate, ownerType]);

  if (!ownerType) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Coordinated Entry Rules'
        title={`Add ${HmisEnums.CeMatchRuleOwner[ownerType]} Rule`}
      />
      <CeMatchRuleForm
        ownerType={ownerType}
        onSaved={returnToRulesOverview}
        onCancel={returnToRulesOverview}
      />
    </>
  );
};

export default CeMatchRuleEditorPage;
