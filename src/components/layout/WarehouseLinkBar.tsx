import HomeIcon from '@mui/icons-material/Home';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import StorageIcon from '@mui/icons-material/Storage';
import { AppBar, Button, Toolbar } from '@mui/material';

import ButtonLink from '../elements/ButtonLink';

const height = '40px';
const linkStyles = {
  height,
  color: 'white',
  borderRadius: 0,
  py: 0,
  px: 2,
  mx: 1,
};

const WarehouseLinkBar = () => {
  if (import.meta.env.MODE !== 'staging') return null;

  if (!import.meta.env.PUBLIC_WAREHOUSE_URL && !import.meta.env.PUBLIC_CAS_URL)
    return null;

  return (
    <AppBar
      position='static'
      color='default'
      elevation={0}
      sx={{
        backgroundColor: (theme) => theme.palette.grey[900],
        height,
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
        {import.meta.env.PUBLIC_WAREHOUSE_URL && (
          <Button
            variant='text'
            href={import.meta.env.PUBLIC_WAREHOUSE_URL}
            target='_blank'
            startIcon={<StorageIcon />}
            sx={linkStyles}
          >
            Warehouse
          </Button>
        )}
        {import.meta.env.PUBLIC_CAS_URL && (
          <Button
            variant='text'
            href={import.meta.env.PUBLIC_CAS_URL}
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
