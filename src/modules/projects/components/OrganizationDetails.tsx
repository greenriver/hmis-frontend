import { Stack } from '@mui/material';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import NotCollectedText from '@/components/elements/NotCollectedText';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HmisEnums } from '@/types/gqlEnums';
import { OrganizationDetailFieldsFragment } from '@/types/gqlTypes';

const OrganizationDetails = ({
  organization,
}: {
  organization: OrganizationDetailFieldsFragment;
}) => {
  const fallback = <NotCollectedText variant='body2' />;
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
      <CommonLabeledTextBlock title='Description'>
        {organization.description || fallback}
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Contact Information'>
        {organization.contactInformation || fallback}
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Victim Service Provider'>
        <HmisEnum
          value={organization?.victimServiceProvider}
          enumMap={HmisEnums.NoYesMissing}
        />
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Organization ID'>
        <ClickToCopyId value={organization.id} />
      </CommonLabeledTextBlock>
    </Stack>
  );
};

export default OrganizationDetails;
