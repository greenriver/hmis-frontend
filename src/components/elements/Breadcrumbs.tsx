import {
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps,
  Link,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams, generatePath } from 'react-router-dom';

interface Props extends BreadcrumbsProps {
  crumbs: { label: string; to: string }[];
}

const Breadcrumbs = ({ crumbs, ...rest }: Props) => {
  const params = useParams();

  return (
    <MuiBreadcrumbs aria-label='breadcrumb' sx={{ mb: 3 }} {...rest}>
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
          <Link
            component={RouterLink}
            to={filledInPath}
            key={to}
            variant='body2'
          >
            {label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};
export default Breadcrumbs;
