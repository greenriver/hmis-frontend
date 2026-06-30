import { SvgIconComponent } from '@mui/icons-material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps,
  Stack,
  Typography,
  TypographyVariant,
} from '@mui/material';

import RouterLink from './RouterLink';

import useSafeParams from '@/hooks/useSafeParams';
import { generateSafePath } from '@/utils/pathEncoding';

export interface Breadcrumb {
  label: string;
  to: string;
  icon?: SvgIconComponent;
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
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        ol: {
          // padding for focus ring
          paddingLeft: '5px',
        },
        ...sx,
      }}
      {...rest}
    >
      {crumbs.map(({ label, to, icon: Icon }, index) => {
        if (index === crumbs.length - 1) {
          return (
            <Typography variant={variant} key={to} sx={{ display: 'inline' }}>
              {label}
            </Typography>
          );
        }

        // Fill in path with params we already have (e.g. replace :clientId with id)
        const filledInPath = generateSafePath(to, params);
        return (
          <RouterLink
            aria-label={label}
            to={filledInPath}
            key={to}
            variant={variant}
            data-testid={`breadcrumb-${index}`}
          >
            {Icon ? (
              <Stack direction={'row'} gap={0.75} alignItems='center'>
                <Icon fontSize='inherit' />
                {label}
              </Stack>
            ) : (
              label
            )}
          </RouterLink>
        );
      })}
    </MuiBreadcrumbs>
  );
};
export default Breadcrumbs;
