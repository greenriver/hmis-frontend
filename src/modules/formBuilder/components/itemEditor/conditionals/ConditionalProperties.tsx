import { Box, Typography } from '@mui/material';
import ManageEnableWhen, { ManageEnableWhenProps } from './ManageEnableWhen';

interface Props extends ManageEnableWhenProps {}

const ConditionalProperties: React.FC<Props> = (props) => {
  return (
    <>
      <Typography variant='h5'>Conditionals</Typography>
      <Box sx={{ mb: 2 }}>
        <ManageEnableWhen {...props} />
      </Box>
    </>
  );
};

export default ConditionalProperties;
