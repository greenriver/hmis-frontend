import HomeIcon from '@mui/icons-material/Home';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import StorageIcon from '@mui/icons-material/Storage';
import { AppBar, Button, Toolbar } from '@mui/material';

import ButtonLink from '../elements/ButtonLink';

import { OP_LINK_BAR_HEIGHT } from './layoutConstants';

import { useHmisAppSettings } from '@/modules/hmisAppSettings/hooks';

const linkStyles = {
  height: OP_LINK_BAR_HEIGHT,
  color: 'white',
  borderRadius: 0,
  py: 0,
  px: 2,
  mx: 1,
};

const WarehouseLinkBar = () => {
  const { warehouseUrl, casUrl } = useHmisAppSettings();
  if (!warehouseUrl && !casUrl) return null;

  return (
    <AppBar
      position='sticky'
      color='default'
      elevation={0}
      sx={{
        backgroundColor: (theme) => theme.palette.grey[900],
        height: OP_LINK_BAR_HEIGHT,
        border: 'none',
      }}
    >
      <Toolbar
        sx={{
          flexWrap: 'wrap',
          justifyContent: 'end',
          alignItems: 'stretch',
          pr: '10px !important',
        }}
      >
        {warehouseUrl && (
          <Button
            variant='text'
            href={warehouseUrl}
            target='_blank'
            startIcon={<StorageIcon />}
            sx={linkStyles}
          >
            Warehouse
          </Button>
        )}
        {casUrl && (
          <Button
            variant='text'
            href={casUrl}
            target='_blank'
            startIcon={<HomeIcon />}
            sx={linkStyles}
          >
            CAS
          </Button>
        )}
        <ButtonLink
          variant='text'
          to='/'
          startIcon={<PersonPinIcon />}
          sx={{
            ...linkStyles,
            backgroundColor: 'secondary.main',
            '&:hover': { backgroundColor: 'secondary.main' },
          }}
        >
          HMIS
        </ButtonLink>
      </Toolbar>
    </AppBar>
  );
};
export default WarehouseLinkBar;
