import { Stack, Typography } from '@mui/material';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupDetailFieldsFragment;
}

const UnitGroupCeConfigurationCard: React.FC<Props> = ({ unitGroup }) => {
  const { workflowTemplateName, supportsDirectReferral } = unitGroup;
  const missingWorkflowTemplateText = (
    <Typography variant='inherit' color='error.dark'>
      Configure Workflow
    </Typography>
  );
  return (
    <CommonCard title='Configuration'>
      <Stack gap={1}>
        <CommonLabeledTextBlock title='Workflow Template' variant='body1'>
          {workflowTemplateName || missingWorkflowTemplateText}
        </CommonLabeledTextBlock>
        <CommonLabeledTextBlock
          title='Supports Direct Referral'
          variant='body1'
        >
          <YesNoDisplay booleanValue={supportsDirectReferral} />
        </CommonLabeledTextBlock>
      </Stack>
    </CommonCard>
  );
};

export default UnitGroupCeConfigurationCard;
