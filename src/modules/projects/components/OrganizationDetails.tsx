import { Stack } from '@mui/material';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HmisEnums } from '@/types/gqlEnums';
import {
  NoYesMissing,
  OrganizationDetailFieldsFragment,
} from '@/types/gqlTypes';

const OrganizationDetails = ({
  organization,
}: {
  organization: OrganizationDetailFieldsFragment;
}) => {
  const hasMaybeLongDetail =
    organization.description || organization.contactInformation;

  return (
    <Stack
      columnGap={10}
      rowGap={3}
      direction={hasMaybeLongDetail ? 'column' : 'row'}
      flexWrap='wrap'
      sx={{ p: 2 }}
    >
      {organization.description && (
        <CommonLabeledTextBlock title='Description'>
          {organization.description}
        </CommonLabeledTextBlock>
      )}
      {organization.contactInformation && (
        <CommonLabeledTextBlock title='Contact Information'>
          {organization.contactInformation}
        </CommonLabeledTextBlock>
      )}
      <CommonLabeledTextBlock title='Organization ID'>
        <ClickToCopyId value={organization.hudId} />
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Victim Service Provider'>
        <HmisEnum
          value={
            organization?.victimServiceProvider || NoYesMissing.DataNotCollected
          }
          enumMap={HmisEnums.NoYesMissing}
        />
      </CommonLabeledTextBlock>
    </Stack>
  );
};

export default OrganizationDetails;
