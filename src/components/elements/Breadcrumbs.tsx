import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps,
  Typography,
} from '@mui/material';
import { generatePath, useParams } from 'react-router-dom';

import RouterLink from './RouterLink';

export interface Breadcrumb {
  label: string;
  to: string;
}
interface Props extends BreadcrumbsProps {
  crumbs: Breadcrumb[];
}

const Breadcrumbs = ({ crumbs, sx, ...rest }: Props) => {
  const params = useParams();

  return (
    <MuiBreadcrumbs
      aria-label='breadcrumb'
      separator={<KeyboardArrowRightIcon fontSize='small' sx={{ mx: 0 }} />}
      sx={{
        '.MuiBreadcrumbs-li': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'no-wrap',
        },
        ...sx,
      }}
      {...rest}
    >
      {crumbs.map(({ label, to }, index) => {
        if (index === crumbs.length - 1) {
          return (
            <Typography variant='body2' key={to}>
              {label}
            </Typography>
          );
        }

        // Fill in path with params we already have (e.g. replace :clientId with id)
        const filledInPath = generatePath(to, params);
        return (
          <RouterLink to={filledInPath} key={to} variant='body2'>
            {label}
          </RouterLink>
        );
      })}
    </MuiBreadcrumbs>
  );
};
export default Breadcrumbs;
