import { Button, SxProps } from '@mui/material';
import { useMemo } from 'react';

import { AddPersonIcon } from '@/components/elements/SemanticIcons';
import { useIsMobile } from '@/hooks/useIsMobile';
import { localConstantsForClientForm } from '@/modules/client/hooks/useClientFormDialog';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  RecordFormRole,
  SubmittedEnrollmentResultFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  projectId: string;
  householdId?: string;
  onCompleted?: (data: SubmittedEnrollmentResultFieldsFragment) => void;
  disabled?: boolean;
  sx?: SxProps;
}
const AddNewClientButton: React.FC<Props> = ({
  projectId,
  householdId,
  onCompleted,
  sx,
  disabled,
}) => {
  const cocCount = useProjectCocsCountFromCache(projectId);

  const memoedArgs = useMemo(
    () => ({
      formRole: RecordFormRole.NewClientEnrollment,
      localConstants: {
        ...localConstantsForClientForm(),
        householdId,
        projectCocCount: cocCount,
      },
      inputVariables: { projectId },
      pickListArgs: { projectId, householdId },
      onCompleted,
    }),
    [cocCount, householdId, onCompleted, projectId]
  );

  const { openFormDialog, renderFormDialog } =
    useFormDialog<SubmittedEnrollmentResultFieldsFragment>(memoedArgs);
  const isMobile = useIsMobile();

  return (
    <>
      <Button
        onClick={openFormDialog}
        data-testid='addClientButton'
        sx={{ px: 3, mt: 3, float: 'right', ...sx }}
        startIcon={<AddPersonIcon />}
        variant='outlined'
        disabled={disabled}
      >
        Add New Client
      </Button>
      {renderFormDialog({
        title: 'Enroll a New Client',
        submitButtonText: 'Create & Enroll Client',
        DialogProps: { maxWidth: 'lg', fullScreen: isMobile },
      })}
    </>
  );
};

export default AddNewClientButton;
