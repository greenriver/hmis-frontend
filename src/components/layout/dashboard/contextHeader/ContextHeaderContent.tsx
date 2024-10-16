import { Box } from '@mui/material';

import Breadcrumbs, { Breadcrumb } from '@/components/elements/Breadcrumbs';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/layoutConstants';

interface Props {
  breadcrumbs: Breadcrumb[];
}

const ContextHeaderContent: React.FC<Props> = ({ breadcrumbs }) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      flex={1}
      sx={{ pl: 3 }}
    >
      <Breadcrumbs
        crumbs={breadcrumbs}
        sx={{
          '.MuiBreadcrumbs-ol': {
            overflow: 'hidden',
            height: CONTEXT_HEADER_HEIGHT,
          },
        }}
      />
    </Box>
  );
};

export default ContextHeaderContent;
