import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps,
  Typography,
  TypographyVariant,
} from '@mui/material';

import RouterLink from './RouterLink';

import useSafeParams from '@/hooks/useSafeParams';
import generateSafePath from '@/utils/generateSafePath';

export interface Breadcrumb {
  label: string;
  to: string;
}
interface Props extends BreadcrumbsProps {
  crumbs: Breadcrumb[];
  variant?: TypographyVariant;
}

const Breadcrumbs = ({ crumbs, variant = 'body2', sx, ...rest }: Props) => {
  const params = useSafeParams();

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
            <Typography variant={variant} key={to}>
              {label}
            </Typography>
          );
        }

        // Fill in path with params we already have (e.g. replace :clientId with id)
        const filledInPath = generateSafePath(to, params);
        return (
          <RouterLink
            to={filledInPath}
            key={to}
            variant={variant}
            data-testid={`breadcrumb-${index}`}
          >
            {label}
          </RouterLink>
        );
      })}
    </MuiBreadcrumbs>
  );
};
export default Breadcrumbs;
