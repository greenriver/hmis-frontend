import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Theme, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import RouterLink from '@/components/elements/RouterLink';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import { Routes } from '@/routes/routes';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentNavHeader = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  const projectPath = generateSafePath(Routes.PROJECT, {
    projectId: enrollment.project.id,
  });
  return (
    <Stack gap={2}>
      <Stack direction={'row'}>
        <Typography variant='h4'>{enrollment.project.projectName}</Typography>
        <RouterLink
          to={projectPath}
          aria-label={`Go to project '${enrollment.project.projectName}'`}
          sx={{
            fontSize: (theme: Theme) => theme.typography.h4.fontSize,
            display: 'flex',
            pl: 0.8,
          }}
          Icon={ExitToAppIcon}
        ></RouterLink>
      </Stack>
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
