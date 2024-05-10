import { Cancel, History, Save, UploadFile } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Button,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuList,
  Paper,
  Typography,
} from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Stack } from '@mui/system';
import React, { useMemo, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import Loading from '@/components/elements/Loading';
import { EditIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import FormTreeView from '@/modules/admin/components/forms/FormTreeView';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { useGetFormDefinitionFieldsForEditorQuery } from '@/types/gqlTypes';

const FormEditorPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionFieldsForEditorQuery({
      variables: { id: formId },
    });

  const formRole = useMemo(
    () => (formDefinition?.role ? HmisEnums.FormRole[formDefinition.role] : ''),
    [formDefinition]
  );

  // TODO - update the API to return correct values
  const lastUpdatedDate = formatDateForDisplay(new Date());
  const lastUpdatedBy = 'User Name';

  const [optionsMenuElement, setOptionsMenuElement] =
    useState<null | HTMLElement>(null);
  const optionsMenuOpen = Boolean(optionsMenuElement);
  const handleOptionsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setOptionsMenuElement(event.currentTarget);
  const handleOptionsMenuClose = () => setOptionsMenuElement(null);

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Stack direction='row' gap={1}>
          <Typography sx={{ mb: 2 }} variant='h2'>
            {formDefinition.title}
          </Typography>
          <ButtonTooltipContainer title='Edit Title'>
            <IconButton
              aria-label='edit title'
              onClick={() => {}}
              size='small'
              sx={{ color: (theme) => theme.palette.links, mt: 0.25 }}
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </ButtonTooltipContainer>
        </Stack>
        <Stack direction='row' sx={{ alignItems: 'center' }}>
          <Grid container>
            <Grid item xs={3}>
              Form Identifier
            </Grid>
            <Grid item xs={3}>
              Form Title (Role)
            </Grid>
            <Grid item xs={3}>
              Last Updated
            </Grid>
            <Grid item xs={3}>
              Status
            </Grid>
            <Grid item xs={3}>
              {formDefinition.identifier}
            </Grid>
            <Grid item xs={3}>
              {formRole}
            </Grid>
            <Grid item xs={3}>
              {lastUpdatedDate}
            </Grid>
            <Grid item xs={3}>
              {formDefinition.status}
            </Grid>
          </Grid>
          <Stack direction='row' spacing={2}>
            <Button variant='outlined' startIcon={<VisibilityIcon />}>
              Preview
            </Button>
            <Button
              variant='outlined'
              aria-controls={optionsMenuOpen ? 'basic-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={optionsMenuOpen ? 'true' : undefined}
              onClick={handleOptionsMenuOpen}
              color='inherit'
              endIcon={<MenuIcon />}
            >
              Options
            </Button>
            <Menu
              anchorEl={optionsMenuElement}
              open={optionsMenuOpen}
              onClose={handleOptionsMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuList dense sx={{ p: 0, width: '200px' }}>
                <ListSubheader>Draft Options</ListSubheader>
                <MenuItem onClick={handleOptionsMenuClose}>
                  <ListItemIcon>
                    <Save fontSize='small' />
                  </ListItemIcon>
                  <ListItemText>Save Draft</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleOptionsMenuClose}>
                  <ListItemIcon>
                    <Cancel fontSize='small' />
                  </ListItemIcon>
                  <ListItemText>Discard Draft</ListItemText>
                </MenuItem>

                <Divider />
                <ListSubheader>Publish</ListSubheader>

                <MenuItem onClick={handleOptionsMenuClose}>
                  <ListItemIcon>
                    <UploadFile color='primary' fontSize='small' />
                  </ListItemIcon>
                  <ListItemText>Publish Form</ListItemText>
                </MenuItem>

                <Divider />
                <ListSubheader>Form Settings</ListSubheader>

                <MenuItem onClick={handleOptionsMenuClose}>
                  <ListItemIcon>
                    <EditIcon fontSize='small' />
                  </ListItemIcon>
                  <ListItemText>Edit Form Details</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleOptionsMenuClose}>
                  <ListItemIcon>
                    <History fontSize='small' />
                  </ListItemIcon>
                  <ListItemText>Version History</ListItemText>
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Stack>
      </Paper>
      <Box sx={{ p: 4 }}>
        <FormTreeView definition={formDefinition.definition} />
      </Box>
      <Paper sx={{ p: 4 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          sx={{ alignItems: 'center' }}
        >
          <Stack direction='row' gap={2}>
            <Button variant='outlined'>Save Draft</Button>
            <Button>Publish</Button>
          </Stack>
          <Typography variant='body2'>
            Last saved on {lastUpdatedDate} by {lastUpdatedBy}
          </Typography>
        </Stack>
      </Paper>
    </>
  );
};

export default FormEditorPage;
