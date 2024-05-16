import { Cancel, History, Save, UploadFile } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuList,
} from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useState } from 'react';
import { EditIcon } from '@/components/elements/SemanticIcons';

const FormOptionsMenu = () => {
  const [optionsMenuElement, setOptionsMenuElement] =
    useState<null | HTMLElement>(null);
  const optionsMenuOpen = Boolean(optionsMenuElement);
  const handleOptionsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setOptionsMenuElement(event.currentTarget);
  const handleOptionsMenuClose = () => setOptionsMenuElement(null);

  return (
    <>
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
    </>
  );
};

export default FormOptionsMenu;
