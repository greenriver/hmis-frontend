import { Box, Stack } from '@mui/system';
import React from 'react';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import EditCeDefaultContactsModal from '@/modules/ce/components/defaultContacts/EditCeDefaultContactsModal';
import { ProjectWithCeDefaultContactsFragment } from '@/types/gqlTypes';

interface Props {
  open: boolean;
  onClose: () => void;
  project: ProjectWithCeDefaultContactsFragment;
}
const EditProjectCeDefaultContactsModal: React.FC<Props> = ({
  project,
  open,
  onClose,
}) => {
  const dialogContentHeader = (
    <Box>
      <Stack direction='row' spacing={4}>
        <CommonLabeledTextBlock title='Project'>
          {project.projectName}
        </CommonLabeledTextBlock>
      </Stack>
    </Box>
  );

  return (
    <EditCeDefaultContactsModal
      projectId={project.id}
      ceSwimlanes={project.ceSwimlanes}
      initialValue={project.ceDefaultContacts}
      title='Edit Project Contacts'
      dialogContentHeader={dialogContentHeader}
      open={open}
      onClose={onClose}
    />
  );
};

export default EditProjectCeDefaultContactsModal;
