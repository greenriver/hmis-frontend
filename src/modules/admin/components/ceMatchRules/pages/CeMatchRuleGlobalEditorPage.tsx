import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CeMatchRuleForm from '../editor/CeMatchRuleForm';
import PageTitle from '@/components/layout/PageTitle';
import { AdminDashboardRoutes } from '@/routes/routes';
import { CeMatchRuleOwnerType } from '@/types/gqlTypes';

const CeMatchRuleGlobalEditorPage: React.FC = () => {
  const navigate = useNavigate();

  const returnToRulesOverview = useCallback(() => {
    navigate(AdminDashboardRoutes.CE_RULES);
  }, [navigate]);

  return (
    <>
      <PageTitle
        overlineText='Coordinated Entry Rules'
        title='Add Global Rule'
      />
      <CeMatchRuleForm
        ownerType={CeMatchRuleOwnerType.DataSource}
        onCancel={returnToRulesOverview}
      />
    </>
  );
};

export default CeMatchRuleGlobalEditorPage;
