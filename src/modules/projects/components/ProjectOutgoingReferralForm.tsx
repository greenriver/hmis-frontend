import { Box, Stack } from '@mui/system';
import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import ProjectOutgoingReferralDetailsSubForm from './ProjectOutgoingReferralDetailsSubForm';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import DynamicField from '@/modules/form/components/DynamicField';
import { itemDefaults } from '@/modules/form/util/formUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ItemType,
  PickListOption,
  PickListType,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  project: ProjectAllFieldsFragment;
}

type FormState = {
  selectedEnrollment?: PickListOption;
  selectedProject?: PickListOption;
};

const ProjectOutgoingReferralForm: React.FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>({});

  const pickListArgsForEnrollmentPicker = useMemo(
    () => ({ projectId: project.id }),
    [project]
  );

  return (
    <Box>
      <Stack gap={2}>
        {/* use DynamicField to get remote Pick list behavior */}
        <DynamicField
          value={formState.selectedEnrollment}
          item={{
            ...itemDefaults,
            type: ItemType.Choice,
            required: true,
            linkId: 'enrollment',
            text: 'HoH Enrollment',
            pickListReference: PickListType.OpenHohEnrollmentsForProject,
          }}
          pickListArgs={pickListArgsForEnrollmentPicker}
          itemChanged={({ value }) =>
            setFormState((old) => ({ ...old, selectedEnrollment: value }))
          }
        />
        {/* use DynamicField to get remote Pick list behavior */}
        <DynamicField
          value={formState.selectedProject}
          item={{
            ...itemDefaults,
            type: ItemType.Choice,
            required: true,
            linkId: 'project',
            text: 'Project',
            pickListReference: PickListType.OpenProjects,
          }}
          itemChanged={({ value }) =>
            setFormState((old) => ({ ...old, selectedProject: value }))
          }
        />
        {formState.selectedProject && formState.selectedEnrollment && (
          <SentryErrorBoundary>
            <ProjectOutgoingReferralDetailsSubForm
              enrollmentId={formState.selectedEnrollment.code}
              destinationProjectId={formState.selectedProject.code}
              onSuccess={() =>
                navigate(
                  generateSafePath(ProjectDashboardRoutes.REFERRALS, {
                    projectId: project.id,
                  })
                )
              }
            />
          </SentryErrorBoundary>
        )}
      </Stack>
    </Box>
  );
};

export default ProjectOutgoingReferralForm;
