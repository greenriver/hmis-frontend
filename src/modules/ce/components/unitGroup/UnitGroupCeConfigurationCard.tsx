import { Stack, Typography } from '@mui/material';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupDetailFieldsFragment;
}

const UnitGroupCeConfigurationCard: React.FC<Props> = ({ unitGroup }) => {
  const missingWorkflowTemplateText = (
    <Typography variant='inherit' color='error.dark'>
      Configure Workflow
    </Typography>
  );
  return (
    <CommonCard title='Configuration'>
      <Stack gap={1}>
        <CommonLabeledTextBlock title='Workflow Template' variant='body1'>
          {unitGroup.workflowTemplateName || missingWorkflowTemplateText}
        </CommonLabeledTextBlock>
      </Stack>
    </CommonCard>
  );
};

export default UnitGroupCeConfigurationCard;
