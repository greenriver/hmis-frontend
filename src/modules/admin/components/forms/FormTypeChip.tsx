import { Chip } from '@mui/material';
import { HmisEnums } from '@/types/gqlEnums';
import { FormRole } from '@/types/gqlTypes';

// maybe add explanation for occurrence point here

const FormTypeChip = ({ role }: { role?: FormRole }) =>
  role && (
    <Chip
      label={HmisEnums.FormRole[role]}
      size='small'
      variant='outlined'
      sx={{ width: 'fit-content', backgroundColor: 'background.paper' }}
    />
  );
export default FormTypeChip;
