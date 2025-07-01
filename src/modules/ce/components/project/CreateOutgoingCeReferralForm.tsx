import { Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import DynamicField from '@/modules/form/components/DynamicField';
import ProjectOutgoingReferralDetailsSubForm from '@/modules/referrals/components/ProjectOutgoingReferralDetailsSubForm';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  PickListOption,
  ItemType,
  PickListType,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  project: ProjectAllFieldsFragment;
}

type FormState = {
  selectedEnrollment?: PickListOption;
  selectedProject?: PickListOption;
};

const CreateOutgoingCeReferralForm: React.FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>({});

  const pickListArgsForEnrollmentPicker = useMemo(
    () => ({ projectId: project.id }),
    [project]
  );

  // Select household
  // Select project to refer to (based on project config saying it can receive DIRECT referrals)
  // (Select unit group)
  // -- form displays wether selected household is eligible or not --
  // -- if eligible, enter data for first task? --
  // Enter data for first task -- in Allegheny, this is just Unit Type selection and "Resource Coordinator Notes"
  // Hit "Create Referral" button to submit referral
  //   -- this will create the referral and the first task. the next tasks become available and assigned to default contacts? eesh
  return (
    <Paper
      sx={{
        py: 3,
        px: 2.5,
        pageBreakInside: 'avoid',
        maxWidth: 500,
      }}
    >
      <Stack gap={2}>
        {/* Choose which household to refer. Use DynamicField to get remote Pick list behavior */}
        <DynamicField
          value={formState.selectedEnrollment}
          item={{
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
        {/* Choose which Project to refer to. Use DynamicField to get remote Pick list behavior */}
        <DynamicField
          value={formState.selectedProject}
          item={{
            type: ItemType.Choice,
            required: true,
            linkId: 'project',
            text: 'Project',
            pickListReference: PickListType.ProjectsReceivingReferrals, // TODO: ce version of this
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
    </Paper>
  );
};
export default CreateOutgoingCeReferralForm;
