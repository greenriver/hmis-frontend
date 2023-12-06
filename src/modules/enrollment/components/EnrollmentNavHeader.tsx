import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import RouterLink from '@/components/elements/RouterLink';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const EnrollmentNavHeader = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  const projectPath = generateSafePath(Routes.PROJECT, {
    projectId: enrollment.project.id,
  });
  return (
    <Stack gap={1.5}>
      <Stack direction={'row'}>
        <Typography variant='h5'>
          {clientBriefName(enrollment.client)}
        </Typography>
      </Stack>
      <CommonLabeledTextBlock title='Project'>
        <RouterLink data-testid='projectLink' to={projectPath}>
          {enrollment.project.projectName}
        </RouterLink>
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Project Type'>
        <HmisEnum
          value={enrollment.project.projectType}
          enumMap={HmisEnums.ProjectType}
        />
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Enrollment Period'>
        <EnrollmentDateRangeWithStatus enrollment={enrollment} />
      </CommonLabeledTextBlock>
      <CommonLabeledTextBlock title='Enrollment ID'>
        <ClickToCopyId value={enrollment.id} />
      </CommonLabeledTextBlock>
    </Stack>
  );
};
export default EnrollmentNavHeader;
