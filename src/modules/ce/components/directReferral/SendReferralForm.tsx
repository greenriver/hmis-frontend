import { Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo, useState } from 'react';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import DynamicField from '@/modules/form/components/DynamicField';
import {
  ItemType,
  PickListOption,
  PickListType,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  project: ProjectAllFieldsFragment;
}

type FormState = {
  selectedEnrollment?: PickListOption;
  selectedProject?: PickListOption;
  selectedUnitGroup?: PickListOption;
};

const SendReferralForm: React.FC<Props> = ({ project }) => {
  const [formState, setFormState] = useState<FormState>({});

  const pickListArgs = useMemo(() => ({ projectId: project.id }), [project]);

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
        <DynamicField
          value={formState.selectedEnrollment}
          item={{
            type: ItemType.Choice,
            required: true,
            linkId: 'enrollment',
            text: 'HoH Enrollment',
            pickListReference: PickListType.OpenHohEnrollmentsForProject,
          }}
          pickListArgs={pickListArgs}
          itemChanged={({ value }) =>
            setFormState((old) => ({ ...old, selectedEnrollment: value }))
          }
        />
        <DynamicField
          value={formState.selectedProject}
          item={{
            type: ItemType.Choice,
            required: true,
            linkId: 'project',
            text: 'Project',
            pickListReference: PickListType.ProjectsAcceptingCeReferrals,
          }}
          pickListArgs={pickListArgs}
          itemChanged={({ value }) =>
            setFormState((old) => ({
              ...old,
              selectedProject: value,
              selectedUnitGroup: undefined,
            }))
          }
        />
        {formState.selectedProject && (
          <SentryErrorBoundary>
            <DynamicField
              value={formState.selectedUnitGroup}
              item={{
                type: ItemType.Choice,
                required: true,
                linkId: 'unitGroup',
                text: 'Unit Group',
                pickListReference: PickListType.AvailableUnitGroupsForProject,
              }}
              pickListArgs={{ projectId: formState.selectedProject.code }}
              itemChanged={({ value }) =>
                setFormState((old) => ({ ...old, selectedUnitGroup: value }))
              }
            />
          </SentryErrorBoundary>
        )}
        {formState.selectedProject && formState.selectedEnrollment && (
          <SentryErrorBoundary>
            {/*<ProjectOutgoingReferralDetailsSubForm*/}
            {/*  enrollmentId={formState.selectedEnrollment.code}*/}
            {/*  destinationProjectId={formState.selectedProject.code}*/}
            {/*  onSuccess={() =>*/}
            {/*    navigate(*/}
            {/*      generateSafePath(ProjectDashboardRoutes.REFERRALS, {*/}
            {/*        projectId: project.id,*/}
            {/*      })*/}
            {/*    )*/}
            {/*  }*/}
            {/*/>*/}
          </SentryErrorBoundary>
        )}
      </Stack>
    </Paper>
  );
};

export default SendReferralForm;
