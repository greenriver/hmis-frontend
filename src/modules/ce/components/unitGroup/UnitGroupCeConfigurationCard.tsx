import { Stack, Typography } from '@mui/material';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { HmisEnums } from '@/types/gqlEnums';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupDetailFieldsFragment;
}

const UnitGroupCeConfigurationCard: React.FC<Props> = ({ unitGroup }) => {
  const missingWorkflowTemplateText = (
    <Typography variant='inherit' color='text.secondary'>
      Not Specified
    </Typography>
  );
  const { workflowTemplateName, directReferralWorkflowTemplateName } =
    unitGroup;

  return (
    <CommonCard title='Configuration'>
      <Stack gap={1}>
        <CommonLabeledTextBlock title='Referral Workflow' variant='body1'>
          {workflowTemplateName || missingWorkflowTemplateText}
        </CommonLabeledTextBlock>
        {directReferralWorkflowTemplateName && (
          <CommonLabeledTextBlock
            title='Direct Referral Workflow'
            variant='body1'
          >
            {directReferralWorkflowTemplateName}
          </CommonLabeledTextBlock>
        )}
        {unitGroup.ceEventType && (
          <CommonLabeledTextBlock title='CE Event Type' variant='body1'>
            {HmisEnums.EventType[unitGroup.ceEventType]}
          </CommonLabeledTextBlock>
        )}
      </Stack>
    </CommonCard>
  );
};

export default UnitGroupCeConfigurationCard;
