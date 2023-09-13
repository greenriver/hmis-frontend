import { Typography, TypographyProps } from '@mui/material';

import { RelationshipToHoH } from '@/types/gqlTypes';

const HohIndicator = ({
  relationshipToHoh,
  ...props
}: {
  relationshipToHoh: RelationshipToHoH;
} & TypographyProps) => {
  if (relationshipToHoh !== RelationshipToHoH.SelfHeadOfHousehold) {
    return null;
  }
  return (
    // <Tooltip title='Head of Household' arrow>
    <Typography
      variant='subtitle2'
      color='text.disabled'
      {...{ component: 'div', ...props }}
      sx={{
        fontWeight: 600,
        pl: 1,
        pt: 0.5,
        fontSize: '.75rem',
        ...props.sx,
      }}
    >
      HoH
    </Typography>
    // </Tooltip>
  );
};

export default HohIndicator;
