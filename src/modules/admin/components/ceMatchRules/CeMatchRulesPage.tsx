import { Stack } from '@mui/material';

import CeMatchRuleForm from './CeMatchRuleForm';
import PageTitle from '@/components/layout/PageTitle';

const CeMatchRulesPage = () => (
  <Stack gap={2}>
    <PageTitle title='Create CE Match Rule' />
    <CeMatchRuleForm />
  </Stack>
);

export default CeMatchRulesPage;
