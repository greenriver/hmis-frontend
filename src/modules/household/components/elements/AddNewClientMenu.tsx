import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SxProps,
} from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import React, { useMemo } from 'react';
import RouterLink from '@/components/elements/RouterLink';
import {
  AddPersonIcon,
  HouseholdIcon,
} from '@/components/elements/SemanticIcons';
import { useIsMobile } from '@/hooks/useIsMobile';
import { localConstantsForClientForm } from '@/modules/client/hooks/useClientFormDialog';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  RecordFormRole,
  SubmittedEnrollmentResultFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  projectId: string;
  addHouseholdRoute: string;
  onClientAdded?: (data: SubmittedEnrollmentResultFieldsFragment) => void;
  sx?: SxProps;
}

/**
 * Menu with buttons to add & enroll a new client via Dialog, or navigate
 * to page to enroll a household
 */
const AddNewClientMenu: React.FC<Props> = ({
  projectId,
  onClientAdded,
  addHouseholdRoute,
}) => {
  const cocCount = useProjectCocsCountFromCache(projectId);

  const memoedArgs = useMemo(
    () => ({
      formRole: RecordFormRole.NewClientEnrollment,
      localConstants: {
        ...localConstantsForClientForm(),
        projectCocCount: cocCount,
      },
      inputVariables: { projectId },
      pickListArgs: { projectId },
      onCompleted: onClientAdded,
    }),
    [cocCount, onClientAdded, projectId]
  );

  const { openFormDialog, renderFormDialog } =
    useFormDialog<SubmittedEnrollmentResultFieldsFragment>(memoedArgs);
  const isMobile = useIsMobile();

  return (
    <>
      <PopupState variant='popover' popupId='demo-popup-menu'>
        {(popupState) => (
          <>
            <Button
              variant='outlined'
              startIcon={<AddPersonIcon />}
              {...bindTrigger(popupState)}
            >
              Add New Client
            </Button>
            <Menu {...bindMenu(popupState)}>
              <MenuItem
                onClick={() => {
                  popupState.close();
                  openFormDialog();
                }}
              >
                <ListItemIcon>
                  <AddPersonIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>Add New Client</ListItemText>
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to={generateSafePath(addHouseholdRoute, { projectId })}
              >
                <ListItemIcon>
                  <HouseholdIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>Add New Household</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </PopupState>
      {renderFormDialog({
        title: 'Enroll a New Client',
        submitButtonText: 'Create & Enroll Client',
        DialogProps: { maxWidth: 'lg', fullScreen: isMobile },
      })}
    </>
  );
};

export default AddNewClientMenu;
